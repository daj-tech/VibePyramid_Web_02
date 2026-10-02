/* =========================================================
   LOCALLINK
   Simple CSV Reader
   ========================================================= */

const LocalLinkCSVCache = new Map();


async function loadCSV(filePath) {

    if (!filePath) {
        throw new Error("CSV file path is required.");
    }

    if (LocalLinkCSVCache.has(filePath)) {
        return LocalLinkCSVCache.get(filePath);
    }

    const response = await fetch(filePath);

    if (!response.ok) {
        throw new Error(
            `Unable to load CSV: ${filePath} (${response.status})`
        );
    }

    const csvText = await response.text();

    const records = parseCSV(csvText);

    LocalLinkCSVCache.set(filePath, records);

    return records;
}


async function readCSV(filePath) {
    return loadCSV(filePath);
}


async function fetchCSV(filePath) {
    return loadCSV(filePath);
}


function parseCSV(csvText) {

    csvText = csvText.replace(/^\uFEFF/, "");

    const rows = [];

    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < csvText.length; i++) {

        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"' && nextChar === '"') {
            value += '"';
            i++;
            continue;
        }

        if (char === '"') {
            insideQuotes = !insideQuotes;
            continue;
        }

        if (char === "," && !insideQuotes) {
            row.push(value.trim());
            value = "";
            continue;
        }

        if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(value.trim());
            value = "";

            if (row.some(cell => cell !== "")) {
                rows.push(row);
            }

            row = [];
            continue;
        }

        value += char;
    }

    if (value !== "" || row.length > 0) {

        row.push(value.trim());

        if (row.some(cell => cell !== "")) {
            rows.push(row);
        }
    }

    if (rows.length < 2) {
        return [];
    }

    const headers = rows[0].map(header =>
        header
            .replace(/^\uFEFF/, "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "_")
    );

    return rows.slice(1).map(dataRow => {

        const record = {};

        headers.forEach((header, index) => {
            record[header] = dataRow[index] ?? "";
        });

        return record;
    });
}


function clearCSVCache(filePath = null) {

    if (filePath) {
        LocalLinkCSVCache.delete(filePath);
    } else {
        LocalLinkCSVCache.clear();
    }
}


window.LocalLinkCSV = {
    loadCSV,
    readCSV,
    fetchCSV,
    parseCSV,
    clearCSVCache
};