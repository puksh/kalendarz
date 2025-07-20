<template>
  <button
    class="top-right-buttons import-button"
    @click="showImportModal"
    :disabled="!isEditingMode"
    title="Importuj dane do CSV lub Excel"
    aria-label="Importuj dane do CSV lub Excel"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M3 14v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M12 3v12M7 8l5-5 5 5" />
    </svg>
  </button>

  <!-- Import Modal -->
  <div v-if="showModal" class="import-modal">
    <div class="import-modal-content">
      <div class="import-modal-header">
        <h3>Importowanie Danych</h3>
        <button class="close-button" @click="closeImportModal">&times;</button>
      </div>

      <div class="import-content">
        <!-- Drop/Paste Zone -->
        <div
          class="drop-zone"
          :class="{
            'drag-active': isDragging,
            'has-data': parsedData.length > 0
          }"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          @paste="onPaste"
          @click="triggerFileInput"
          tabindex="0"
          ref="dropZone"
        >
          <div v-if="parsedData.length === 0" class="drop-zone-placeholder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="gray"
              stroke-width="2"
            >
              <path
                d="M19 13v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6M12 3v12M8 7l4-4 4 4"
              />
            </svg>
            <p>
              Przeciągnij i upuść plik, wklej ze schowka, bądź kliknij aby
              wybrać plik
            </p>
            <p class="sub-text">
              Wspierane formaty: CSV, Excel ( xlsx, xls ) albo tabela
            </p>
          </div>

          <input
            type="file"
            ref="fileInput"
            style="display: none"
            @change="handleFileUpload"
            accept=".csv,.xlsx,.xls"
          />
        </div>

        <!-- Preview Section -->
        <div v-if="parsedData.length > 0" class="preview-section">
          <h4>Podgląd importowanego miesiąca</h4>
          <div v-if="daysMismatch" class="warning-message">
            Uwaga: Importowany miesiąc ma {{ parsedData[0].shifts.length }} dni,
            a obecnie wybrany ma {{ daysInMonth }} dni.
          </div>

          <div class="preview-table-container">
            <table class="preview-table">
              <thead>
                <tr>
                  <th></th>
                  <th
                    v-for="(_, index) in parsedData[0].shifts"
                    :key="`header-${index}`"
                  >
                    {{ index + 1 }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in parsedData"
                  :key="`row-${rowIndex}`"
                >
                  <td>{{ row.name }}</td>
                  <td
                    v-for="(shift, dayIndex) in row.shifts"
                    :key="`cell-${rowIndex}-${dayIndex}`"
                    class="imported-shift"
                  >
                    {{ shift }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="controls">
            <button class="reset-button" @click="resetImport">Reset</button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-button" @click="closeImportModal">
            Anuluj
          </button>
          <button
            class="import-confirm-button"
            @click="confirmImport"
            :disabled="!parsedData.length"
          >
            Importuj
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { MESSAGES } from '@/constants';
import { addNotification } from '../NotificationMessage.vue';

export default {
  name: 'ButtonImport',
  props: {
    isEditingMode: {
      type: Boolean,
      required: true
    },
    people: {
      type: Array,
      required: true
    },
    monthDays: {
      type: Array,
      required: true
    }
  },
  emits: ['has-changes', 'cells-imported'],
  data() {
    return {
      showModal: false,
      pastedData: '',
      parsedData: [],
      daysMismatch: false,
      importedCells: new Set(),
      isDragging: false
    };
  },
  computed: {
    daysInMonth() {
      return this.monthDays.length;
    }
  },
  mounted() {
    // Set up focus and keyboard events
    this.$nextTick(() => {
      if (this.$refs.dropZone) {
        this.$refs.dropZone.focus();
      }
    });

    // Add global paste event listener
    window.addEventListener('paste', this.handleGlobalPaste);
  },
  beforeUnmount() {
    // Remove global paste event listener
    window.removeEventListener('paste', this.handleGlobalPaste);
  },
  methods: {
    showImportModal() {
      this.showModal = true;
      this.resetImport();
      this.$nextTick(() => {
        if (this.$refs.dropZone) {
          this.$refs.dropZone.focus();
        }
      });
    },

    closeImportModal() {
      this.showModal = false;
    },

    resetImport() {
      this.pastedData = '';
      this.parsedData = [];
      this.importedCells.clear();
    },

    triggerFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click();
      }
    },

    onDragOver(event) {
      this.isDragging = true;
      event.dataTransfer.dropEffect = 'copy';
    },

    onDragLeave() {
      this.isDragging = false;
    },

    onDrop(event) {
      this.isDragging = false;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        this.handleFileData(files[0]);
      } else {
        // Try to get HTML table data
        const html = event.dataTransfer.getData('text/html');
        if (html) {
          this.processHtmlTable(html);
        } else {
          // Fallback to plain text
          const text = event.dataTransfer.getData('text/plain');
          if (text) {
            this.pastedData = text;
            this.parseImportedData();
          }
        }
      }
    },

    onPaste(event) {
      const clipboardData = event.clipboardData || window.clipboardData;

      // Check for HTML content (tables)
      const html = clipboardData.getData('text/html');
      if (html) {
        this.processHtmlTable(html);
        return;
      }

      // Fallback to plain text
      const text = clipboardData.getData('text/plain');
      if (text) {
        this.pastedData = text;
        this.parseImportedData();
      }
    },

    handleGlobalPaste(event) {
      // Only process if modal is open
      if (!this.showModal) return;

      this.onPaste(event);
    },

    processHtmlTable(html) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const tables = doc.querySelectorAll('table');

        if (tables.length > 0) {
          const table = tables[0];
          const rows = table.querySelectorAll('tr');
          let tableText = '';

          rows.forEach((row) => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map((cell) =>
              cell.textContent.trim()
            );
            tableText += rowData.join('\t') + '\n';
          });

          this.pastedData = tableText;
          this.parseImportedData();
        }
      } catch (error) {
        console.error('Error processing HTML table:', error);
        addNotification(MESSAGES.IMPORT_TABLE_PROCESS_ERROR, 'red');
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.handleFileData(file);
      }
    },

    handleFileData(file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        this.parseCSVFile(file);
      } else if (
        file.type.includes('spreadsheetml') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        this.parseExcelFile(file);
      } else {
        addNotification(MESSAGES.IMPORT_UNSUPPORTED_FILE_TYPE, 'red');
      }
    },

    parseCSVFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.pastedData = e.target.result;
        this.parseImportedData();
      };
      reader.readAsText(file);
    },

    async parseExcelFile(file) {
      try {
        const ExcelJS = await import('exceljs');
        const workbook = new ExcelJS.Workbook();

        const reader = new FileReader();
        reader.onload = async (e) => {
          const buffer = e.target.result;
          await workbook.xlsx.load(buffer);

          // Get the first worksheet
          const worksheet = workbook.getWorksheet(1);

          // Convert to CSV format
          let csvData = '';
          worksheet.eachRow((row, rowNumber) => {
            const rowValues = row.values.slice(1); // Remove the first undefined value
            csvData += rowValues.join(',') + '\n';
          });

          this.pastedData = csvData;
          this.parseImportedData();
        };

        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        addNotification(MESSAGES.IMPORT_EXCEL_PROCESS_ERROR, 'red');
      }
    },

    parseImportedData() {
      if (!this.pastedData.trim()) {
        this.parsedData = [];
        return;
      }

      try {
        // Split by lines and filter out empty lines
        const lines = this.pastedData
          .trim()
          .split(/\r?\n/)
          .filter((line) => line.trim());
        if (lines.length < 2) {
          addNotification(MESSAGES.IMPORT_BAD_DATA_FORMAT, 'orange');
          return;
        }

        // Improved CSV parsing with proper quote handling
        const parseCSVLine = (line) => {
          // Handle quoted fields properly
          const result = [];
          let field = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            // Handle quotes
            if (char === '"') {
              if (inQuotes && i < line.length - 1 && line[i + 1] === '"') {
                // Double quotes inside quoted field = escaped quote
                field += '"';
                i++; // Skip the next quote
              } else {
                // Toggle quote state
                inQuotes = !inQuotes;
              }
            }
            // Handle delimiters
            else if (
              (char === ',' || char === '\t' || char === ';') &&
              !inQuotes
            ) {
              result.push(field.trim());
              field = '';
            }
            // Add character to current field
            else {
              field += char;
            }
          }

          // Add the last field
          result.push(field.trim());
          return result;
        };

        // Parse each line properly handling CSV format
        const rows = lines.map(parseCSVLine);

        // First row is headers (days), skip the first cell
        const headerRow = rows[0].slice(1);

        // The rest are data rows
        const dataRows = rows.slice(1);

        // Create structured data
        this.parsedData = dataRows.map((row) => {
          // Get name (first column) - strip quotes if they exist
          const name = row[0].replace(/^"(.*)"$/, '$1');

          // Process the shifts for each day
          const shifts = row.slice(1).map((cell) => {
            // Normalize shift values and strip quotes if they exist
            const normalizedValue = cell
              .replace(/^"(.*)"$/, '$1')
              .toUpperCase()
              .trim();
            if (['D', 'N', 'D N', 'DN'].includes(normalizedValue)) {
              return normalizedValue === 'DN' ? 'D N' : normalizedValue;
            }
            return '';
          });

          return { name, shifts };
        });

        // Filter out rows with empty names
        this.parsedData = this.parsedData.filter((row) => row.name);

        // Check if days count matches the current month
        this.daysMismatch = headerRow.length !== this.monthDays.length;
      } catch (error) {
        console.error('Error parsing imported data:', error);
        addNotification(MESSAGES.IMPORT_DATA_PROCESS_ERROR, 'red');
        this.parsedData = [];
      }
    },

    confirmImport() {
      if (!this.parsedData.length) return;

      // Track which dates were modified for later saving
      const modifiedDates = new Set();

      // Process each person in the parsed data
      this.parsedData.forEach((row) => {
        // Find matching person by name
        const person = this.people.find(
          (p) => p.name.toLowerCase() === row.name.toLowerCase()
        );
        if (!person) {
          addNotification(
            MESSAGES.IMPORT_PERSON_NOT_FOUND.replace('${row.name}', row.name),
            'orange'
          );
          return;
        }

        // Apply shifts for each day
        row.shifts.forEach((shift, dayIndex) => {
          // Make sure we don't go beyond the current month's days
          if (dayIndex < this.monthDays.length) {
            const dayData = this.monthDays[dayIndex];
            const date = dayData.date.toDateString();

            if (shift) {
              // Clear existing assignments for this person
              if (dayData.dayShift1 === person.id) {
                dayData.dayShift1 = null;
              }
              if (dayData.dayShift2 === person.id) {
                dayData.dayShift2 = null;
              }
              if (dayData.nightShift1 === person.id) {
                dayData.nightShift1 = null;
              }
              if (dayData.nightShift2 === person.id) {
                dayData.nightShift2 = null;
              }

              // Add day shift if needed
              if (shift.includes('D')) {
                if (!dayData.dayShift1) {
                  dayData.dayShift1 = person.id;
                  dayData.dayShift1Name = person.name;
                } else if (!dayData.dayShift2) {
                  dayData.dayShift2 = person.id;
                  dayData.dayShift2Name = person.name;
                }
              }

              // Add night shift if needed
              if (shift.includes('N')) {
                if (!dayData.nightShift1) {
                  dayData.nightShift1 = person.id;
                  dayData.nightShift1Name = person.name;
                } else if (!dayData.nightShift2) {
                  dayData.nightShift2 = person.id;
                  dayData.nightShift2Name = person.name;
                }
              }

              // Track this date as modified
              modifiedDates.add(date);

              // Track imported cell for styling
              this.importedCells.add(`${person.id}-${dayData.date.getDate()}`);
            }
          }
        });
      });

      // Save all modified dates to localStorage with only essential data
      modifiedDates.forEach((date) => {
        const dayData = this.monthDays.find(
          (day) => day.date.toDateString() === date
        );
        if (dayData) {
          // Only save the essential shift ID data
          const updatedData = {
            dayShift1: dayData.dayShift1,
            dayShift2: dayData.dayShift2,
            nightShift1: dayData.nightShift1,
            nightShift2: dayData.nightShift2
          };

          localStorage.setItem(date, JSON.stringify(updatedData));
        }
      });

      this.closeImportModal();
      addNotification(MESSAGES.IMPORT_SUCCESS, 'green');
      this.$emit('has-changes', true);

      // Add imported cells to parent component for styling
      this.$emit('cells-imported', Array.from(this.importedCells));
    }
  }
};
</script>

<style scoped>
.import-button {
  position: relative;
  top: 12px;
  right: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

/* Import Modal */
.import-modal {
  position: fixed;
  z-index: var(--z-index-modal);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.import-modal-content {
  background-color: #0a3c3c;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.import-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #1e5e5e;
}

.import-modal-header h3 {
  margin: 0;
  color: #ffffff;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #ffffff;
  cursor: pointer;
}

.import-content {
  padding: 16px;
}

/* Drop Zone */
.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #1e5e5e;
  border-radius: 8px;
  padding: 40px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: rgba(30, 94, 94, 0.1);
  outline: none;
  min-height: 200px;
}

.drop-zone:hover,
.drop-zone:focus {
  border-color: #27bebe;
  background-color: rgba(30, 94, 94, 0.2);
}

.drop-zone.drag-active {
  border-color: #27bebe;
  background-color: rgba(39, 190, 190, 0.1);
  box-shadow: 0 0 10px rgba(39, 190, 190, 0.3);
}

.drop-zone.has-data {
  display: none;
}

.drop-zone-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #cccccc;
}

.drop-zone-placeholder svg {
  margin-bottom: 16px;
  color: #1e5e5e;
}

.drop-zone-placeholder p {
  margin: 4px 0;
}

.drop-zone-placeholder .sub-text {
  font-size: 0.85em;
  color: #999999;
}

.preview-section {
  margin-top: 24px;
}

.warning-message {
  background-color: rgba(255, 165, 0, 0.2);
  color: orange;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.preview-table-container {
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  border-radius: 4px;
  border: 1px solid #1e5e5e;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  border: 1px solid #1e5e5e;
  padding: 6px;
  text-align: center;
}

.preview-table th {
  background-color: #0a3c3c;
  position: sticky;
  top: 0;
  z-index: 1;
}

.imported-shift {
  color: #27bebe;
}

.controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.reset-button {
  background-color: transparent;
  border: 1px solid #1e5e5e;
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.reset-button:hover {
  background-color: rgba(30, 94, 94, 0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid #1e5e5e;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.import-confirm-button {
  background-color: #27bebe;
  border: none;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.import-confirm-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
