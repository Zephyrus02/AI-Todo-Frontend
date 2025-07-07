import { Task } from "@/lib/api";

export interface CSVTaskRow {
  Subject: string;
  "Start Date": string;
  "Start Time": string;
  "End Date": string;
  "End Time": string;
  "All Day Event": string;
  Description: string;
  Location: string;
}

export function tasksToCSV(tasks: Task[]): string {
  const headers = [
    "Subject",
    "Start Date",
    "Start Time",
    "End Date",
    "End Time",
    "All Day Event",
    "Description",
    "Location",
  ];

  const rows = tasks.map((task) => {
    const deadline = new Date(task.deadline);
    const startDate = deadline.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
    const startTime = "10:00 AM"; // Default start time
    const endTime = "11:00 AM"; // Default end time (1 hour duration)

    return [
      task.title,
      startDate,
      startTime,
      startDate, // Same day for end date
      endTime,
      "False",
      task.description,
      task.category_name || "",
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return csvContent;
}

export function parseCSVToTasks(csvContent: string): Partial<Task>[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const expectedHeaders = [
    "Subject",
    "Start Date",
    "Start Time",
    "End Date",
    "End Time",
    "All Day Event",
    "Description",
    "Location",
  ];

  // Validate headers
  const hasRequiredHeaders = expectedHeaders.some((header) =>
    headers.some((h) => h.toLowerCase().includes(header.toLowerCase()))
  );

  if (!hasRequiredHeaders) {
    throw new Error(
      "Invalid CSV format. Please ensure the file has the correct headers."
    );
  }

  const tasks: Partial<Task>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      const rowData: Record<string, string> = {};

      headers.forEach((header, index) => {
        rowData[header] = values[index] || "";
      });

      // Map CSV data to task format
      const subject = rowData["Subject"] || rowData["subject"] || "";
      const description =
        rowData["Description"] || rowData["description"] || "";
      const location = rowData["Location"] || rowData["location"] || "";
      const startDate = rowData["Start Date"] || rowData["start date"] || "";

      if (!subject.trim()) continue;

      // Parse date
      let deadline: string;
      try {
        const parsedDate = new Date(startDate);
        if (isNaN(parsedDate.getTime())) {
          // Try different date formats
          const [month, day, year] = startDate.split("/");
          const fallbackDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
          );
          deadline = fallbackDate.toISOString();
        } else {
          deadline = parsedDate.toISOString();
        }
      } catch {
        // Default to tomorrow if date parsing fails
        deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      }

      const task: Partial<Task> = {
        title: subject.trim(),
        description: description.trim() || "Imported from CSV",
        deadline,
        priority_label: "Medium" as const,
        status: "Pending" as const,
        category_name: location.trim() || undefined,
      };

      tasks.push(task);
    } catch (error) {
      console.warn(`Error parsing CSV line ${i + 1}:`, error);
      continue;
    }
  }

  return tasks;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      i++;
    } else {
      current += char;
      i++;
    }
  }

  values.push(current.trim());
  return values;
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
