function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function parseCSV(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] ?? "";
      return obj;
    }, {});
  });
}

export async function readCSV(filename, region = "thane") {
  const response = await fetch(`/data/${region}/${filename}`);
  if (!response.ok) {
    throw new Error(`Unable to load ${filename}`);
  }
  return parseCSV(await response.text());
}
