import { RegistrationFormData } from '../types';
import { YANDEX_DISK_TOKEN, YANDEX_FILE_PATH } from '../constants';
import * as XLSX_PKG from 'xlsx';

// Handle cases where the CDN module wraps the library in a default export
// We need to support both namespace imports and default object exports depending on the environment/CDN.
const XLSX = XLSX_PKG && (XLSX_PKG as any).default ? (XLSX_PKG as any).default : XLSX_PKG;

// Check if XLSX is loaded correctly with the read function
const isXlsxLoaded = XLSX && typeof XLSX.read === 'function';

export const saveRegistrationToYandex = async (data: RegistrationFormData): Promise<boolean> => {
  console.log("Starting Yandex Disk operation...");
  
  const headers = {
    'Authorization': `OAuth ${YANDEX_DISK_TOKEN}`
  };

  try {
    // 1. Get Download URL
    console.log("Getting download URL...");
    const downloadUrlResponse = await fetch(
      `https://cloud-api.yandex.net/v1/disk/resources/download?path=${encodeURIComponent(YANDEX_FILE_PATH)}`,
      { headers }
    );

    if (!downloadUrlResponse.ok) {
      if (downloadUrlResponse.status === 404) {
        // If file doesn't exist, we would theoretically create a new one, 
        // but for this task we assume the file exists as per the link provided.
        console.error("File not found on Yandex Disk");
        throw new Error("Файл регистрации не найден на диске");
      }
      throw new Error("Failed to get download link");
    }

    const { href: downloadUrl } = await downloadUrlResponse.json();

    // 2. Download the file
    // Note: This might hit CORS if Yandex doesn't allow the origin.
    console.log("Downloading file...");
    const fileResponse = await fetch(downloadUrl);
    if (!fileResponse.ok) throw new Error("Failed to download file content");
    
    const arrayBuffer = await fileResponse.arrayBuffer();

    // 3. Parse Excel
    console.log("Parsing Excel...");
    if (!isXlsxLoaded) {
        throw new Error("XLSX library not loaded correctly");
    }
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
    
    // Assume first sheet is the one we want
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 4. Convert to JSON, append data, convert back
    // Using simple conversion to preserve existing structure best we can
    let rows: any[] = XLSX.utils.sheet_to_json(worksheet);

    const newRow = {
      "ФИО": data.fullName,
      "Город": data.city,
      "Никнейм": data.nickname,
      "Дата рождения": data.birthDate,
      "Педагог": data.teacher,
      "Телефон": data.phone,
      "Ссылка ВК": data.vkLink,
      "Номинации": data.nomination.join(', '),
      "Дата регистрации": new Date().toLocaleString('ru-RU')
    };

    rows.push(newRow);

    const newWorksheet = XLSX.utils.json_to_sheet(rows);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);

    const newFileBuffer = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });

    // 5. Get Upload URL
    console.log("Getting upload URL...");
    const uploadUrlResponse = await fetch(
      `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${encodeURIComponent(YANDEX_FILE_PATH)}&overwrite=true`,
      { headers }
    );

    if (!uploadUrlResponse.ok) throw new Error("Failed to get upload link");
    const { href: uploadUrl } = await uploadUrlResponse.json();

    // 6. Upload file
    console.log("Uploading updated file...");
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: newFileBuffer
    });

    if (!uploadResponse.ok) throw new Error("Failed to upload file");

    console.log("Successfully saved to Yandex Disk");
    return true;

  } catch (error) {
    console.error("Yandex API Error:", error);
    // Re-throw to let App.tsx handle the UI feedback
    throw error;
  }
};