<template>
  <div class="export-container">
    <button
      class="export-button top-right-buttons"
      :class="{
        'excel-position': currentPage === 'ExcelComponent',
        'calendar-position': currentPage === 'CalendarComponent'
      }"
      @click="toggleExportMenu"
      title="Eksportuj harmonogram"
      aria-label="Eksportuj harmonogram"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="export-icon"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    </button>

    <!-- Export Menu -->
    <div
      v-if="showExportMenu"
      class="export-menu"
      :class="[
        {
          'excel-position': currentPage === 'ExcelComponent',
          'calendar-position': currentPage === 'CalendarComponent'
        },
        {
          'mobile-excel': currentPage === 'ExcelComponent' && isMobileView,
          'mobile-calendar': currentPage === 'CalendarComponent' && isMobileView
        }
      ]"
    >
      <button @click="exportToCsv" class="export-option">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M14 3v4a1 1 0 0 0 1 1h4" />
          <path
            d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"
          />
          <path d="M9 17h6" />
          <path d="M9 13h6" />
        </svg>
        <span>CSV</span>
      </button>

      <button @click="exportToExcel" class="export-option">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="lightgreen"
          stroke-width="2"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span>Excel (XLSX)</span>
      </button>

      <button @click="exportToPdf" class="export-option">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="pink"
          stroke-width="2"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span>PDF</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { addNotification } from './NotificationMessage.vue';
import {
  getMonthName,
  getExcelColumnLetter,
  getFormattedShift,
  isWeekendOrHoliday
} from '../utils/exportUtils';
import { downloadFile, arrayBufferToBase64 } from '../utils/fileUtils';
import { isPolishHoliday } from '../utils/polishHolidays';

export default {
  name: 'ButtonExport',
  props: {
    people: {
      type: Array,
      required: true
    },
    monthDays: {
      type: Array,
      required: true
    },
    selectedMonth: {
      type: Number,
      required: true
    },
    selectedYear: {
      type: Number,
      required: true
    },
    currentPage: {
      type: String,
      default: 'ExcelComponent'
    }
  },
  data() {
    return {
      showExportMenu: false,
      isMobileView: false
    };
  },
  mounted() {
    // Close the menu when clicking outside
    document.addEventListener('click', this.handleOutsideClick);
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    window.removeEventListener('resize', this.checkMobileView);
  },
  methods: {
    toggleExportMenu(event) {
      event.stopPropagation();
      this.showExportMenu = !this.showExportMenu;
    },

    handleOutsideClick(event) {
      if (this.showExportMenu && !event.target.closest('.export-container')) {
        this.showExportMenu = false;
      }
    },

    getMonthName() {
      return getMonthName(this.selectedMonth);
    },

    getFilename(extension) {
      return `Harmonogram_${this.getMonthName()}_${this.selectedYear}.${extension}`;
    },

    exportToCsv() {
      // Add UTF-8 BOM to ensure Excel recognizes encoding correctly
      let csvContent = '\ufeff';

      // Create CSV header row with dates
      csvContent += 'Imię';
      for (let day = 1; day <= this.getDaysInMonth(); day++) {
        csvContent += `;${day}`; // Using semicolon as separator for better Excel compatibility
      }
      csvContent += '\r\n'; // Windows-style line endings for Excel

      // Add data for each person
      for (const person of this.people) {
        // Wrap name in quotes to handle any commas or special characters
        csvContent += `"${person.name}"`;

        // Add shift data for each day
        for (let day = 1; day <= this.getDaysInMonth(); day++) {
          csvContent += `;${this.getFormattedShift(person.id, day, ' ') || ''}`; // Use semicolons as separators
        }
        csvContent += '\r\n';
      }

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8'
      });

      downloadFile(blob, this.getFilename('csv'));
      this.showExportMenu = false;
    },

    async exportToPdf() {
      try {
        const { jsPDF } = await import('jspdf');
        const { autoTable } = await import('jspdf-autotable');

        // Create new PDF document
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        try {
          // Fetch the local font file
          const fontResponse = await fetch(
            '/assets/fonts/IBMPlexMono-Regular.ttf'
          );
          if (!fontResponse.ok) throw new Error('Font file not found');

          // Convert font to array buffer
          const fontArrayBuffer = await fontResponse.arrayBuffer();

          // Add font to PDF
          doc.addFileToVFS(
            'IBMPlexMono-Regular.ttf',
            arrayBufferToBase64(fontArrayBuffer)
          );
          doc.addFont('IBMPlexMono-Regular.ttf', 'IBMPlexMono', 'normal');
          doc.setFont('IBMPlexMono');
        } catch (fontError) {
          console.warn('Could not load local font, using fallback', fontError);
          doc.setFont('helvetica');
        }

        // Get page dimensions for centering
        let pageWidth = doc.internal.pageSize.getWidth();

        // Add custom header
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        // First line - all caps and centeredconst
        const headerText = import.meta.env.VITE_PDF_HEADER_TEXT.toString();
        const headerWidth =
          (doc.getStringUnitWidth(headerText) * doc.getFontSize()) /
          doc.internal.scaleFactor;
        doc.text(headerText, (pageWidth - headerWidth) / 2, 15);

        // Second line
        const subheaderTemplate =
          import.meta.env.VITE_PDF_SUBHEADER_TEMPLATE.toString();
        const subheaderText = subheaderTemplate
          .replace('{0}', this.getMonthName())
          .replace('{1}', this.selectedYear);
        const subheaderWidth =
          (doc.getStringUnitWidth(subheaderText) * doc.getFontSize()) /
          doc.internal.scaleFactor;
        doc.text(subheaderText, (pageWidth - subheaderWidth) / 2, 22);

        // Prepare headers
        const headers = ['Imię'];
        for (let day = 1; day <= this.getDaysInMonth(); day++) {
          headers.push(day.toString());
        }

        // Prepare data with special formatting
        const body = this.people.map((person) => {
          const row = [person.name];
          for (let day = 1; day <= this.getDaysInMonth(); day++) {
            const shift = this.getFormattedShift(person.id, day, '\n');
            row.push(shift || '');
          }
          return row;
        });
        autoTable(doc, {
          head: [headers],
          body: body,
          startY: 30,
          theme: 'grid',
          margin: { left: 8 },
          styles: {
            fontSize: 8,
            cellPadding: 3,
            font: 'IBMPlexMono',
            fontStyle: 'normal',
            lineWidth: 0.3,
            minCellHeight: 8,
            halign: 'center',
            cellWidth: 'wrap',
            overflow: 'linebreak' // Better text wrapping
          },
          columnStyles: {
            0: { cellWidth: 24 } // Name column width defined above
          },
          // Use headStyles for ALL headers and override with didParseCell
          headStyles: {
            fillColor: [0, 62, 62],
            textColor: [255, 255, 255],
            fontSize: 6
          },
          didParseCell: function (data) {
            try {
              // Style header cells (weekends and holidays)
              if (
                data.section === 'head' &&
                data.row.index === 0 &&
                data.column.index > 0
              ) {
                const day = parseInt(data.cell.raw.toString());
                if (!isNaN(day)) {
                  const date = new Date(
                    this.selectedYear,
                    this.selectedMonth,
                    day
                  );
                  const dayOfWeek = date.getDay();
                  const isSaturday = dayOfWeek === 6;
                  const isSunday = dayOfWeek === 0;
                  const holidayInfo = isPolishHoliday(date);

                  if (holidayInfo.isHoliday) {
                    // Holiday styling
                    data.cell.styles.fillColor = [255, 255, 255];
                    data.cell.styles.textColor = [204, 0, 0];
                  } else if (isSaturday) {
                    // Saturday headers - green
                    data.cell.styles.fillColor = [0, 153, 0];
                    data.cell.styles.textColor = [255, 255, 255];
                  } else if (isSunday) {
                    // Sunday headers - red
                    data.cell.styles.fillColor = [204, 0, 0];
                    data.cell.styles.textColor = [255, 255, 255];
                  }
                }
              }

              // Style body cells
              else if (data.section === 'body') {
                // Apply alternating row styling
                if (data.row.index % 2 === 1) {
                  data.cell.styles.fillColor = [240, 240, 240]; // Light gray for even rows
                } else {
                  data.cell.styles.fillColor = [255, 255, 255]; // White for odd rows
                }

                // Apply weekend/holiday styling for date columns
                if (data.column.index > 0) {
                  const day = parseInt(data.cell.raw.toString());
                  if (!isNaN(day)) {
                    const date = new Date(
                      this.selectedYear,
                      this.selectedMonth,
                      day
                    );
                    const dayOfWeek = date.getDay();
                    const isSaturday = dayOfWeek === 6;
                    const isSunday = dayOfWeek === 0;
                    const holidayInfo = isPolishHoliday(date);

                    if (holidayInfo.isHoliday) {
                      data.cell.styles.fillColor = [255, 238, 238]; // Light pink for holidays
                    } else if (isSaturday || isSunday) {
                      data.cell.styles.fillColor = [235, 235, 235]; // Gray for weekends
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error in didParseCell:', error);
            }
          }.bind(this),

          didDrawCell: function (data) {
            try {
              if (
                data.section === 'head' &&
                data.row.index === 0 &&
                data.column.index > 0
              ) {
                const day = parseInt(data.cell.raw.toString());
                if (!isNaN(day)) {
                  const date = new Date(
                    this.selectedYear,
                    this.selectedMonth,
                    day
                  );
                  const holidayInfo = isPolishHoliday(date);

                  // Add holiday symbol
                  if (holidayInfo.isHoliday) {
                    const { x, y, width } = data.cell;
                    doc.setFontSize(6);
                    doc.setTextColor(204, 0, 0);
                    doc.text('*', x + width - 3, y + 3);
                    doc.setFontSize(8); // Reset font size
                    doc.setTextColor(0, 0, 0); // Reset text color
                  }
                }
              }
            } catch (error) {
              console.error('Error in didDrawCell:', error);
            }
          }.bind(this)
        });

        // Legend and holiday information
        const finalY = (doc as any).lastAutoTable.finalY || 150;
        const legendY = finalY + 10;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        // Legend
        doc.text('Legenda:', 14, legendY);
        doc.text('D  - Dzienna 07:00-19:00', 14, legendY + 6);
        doc.text('N  - Nocna   19:00-07:00', 14, legendY + 12);
        doc.text('DN - Doba    07:00-07:00', 14, legendY + 18);

        // Holiday information
        const monthHolidays = [];
        for (let day = 1; day <= this.getDaysInMonth(); day++) {
          const date = new Date(this.selectedYear, this.selectedMonth, day);
          const holiday = isPolishHoliday(date);
          if (holiday.isHoliday) {
            monthHolidays.push({ date, name: holiday.name });
          }
        }
        if (monthHolidays.length != 0) {
          doc.text('Święta w tym miesiącu:', 14, legendY + 28);

          monthHolidays.forEach((holiday, index) => {
            doc.text(
              `${holiday.date.getDate()} - ${holiday.name}`,
              14,
              legendY + 34 + index * 6
            );
          });
        }

        // Save PDF
        doc.save(this.getFilename('pdf'));
        this.showExportMenu = false;
        addNotification('Harmonogram zapisany jako PDF', 'green');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        addNotification('Błąd podczas eksportu do PDF', 'red');
      }
    },

    async exportToExcel() {
      try {
        const ExcelJS = await import('exceljs');

        // Create a workbook with a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(
          `${this.getMonthName()} ${this.selectedYear}`
        );

        // Prepare the header row
        const headerRow = ['Imię'];
        for (let day = 1; day <= this.getDaysInMonth(); day++) {
          headerRow.push(day.toString());
        }
        worksheet.addRow(headerRow);

        // Style the header row
        const headerCells = worksheet.getRow(1).eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '003E3E' }
          };
          cell.font = {
            color: { argb: 'FFFFFF' },
            bold: true
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });

        // Add data for each person
        this.people.forEach((person, index) => {
          const rowData = [person.name];
          for (let day = 1; day <= this.getDaysInMonth(); day++) {
            // Keep spaces instead of newlines for Excel
            rowData.push(this.getFormattedShift(person.id, day, ' '));
          }
          worksheet.addRow(rowData);

          // Basic row styling
          const rowIndex = index + 2; // +1 for header, +1 for 0-index

          // Alternate row background
          if (rowIndex % 2 === 0) {
            worksheet.getRow(rowIndex).eachCell((cell) => {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F0F0F0' }
              };
            });
          }
        });

        // Style weekend and holiday columns
        for (let day = 1; day <= this.getDaysInMonth(); day++) {
          const date = new Date(this.selectedYear, this.selectedMonth, day);
          const { isHoliday, name } = isPolishHoliday(date);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          const isSaturday = dayOfWeek === 6;
          const isSunday = dayOfWeek === 0;
          const isWeekend = isSaturday || isSunday;

          if (isWeekend || isHoliday) {
            const colLetter = getExcelColumnLetter(day + 1); // +1 for name column

            // Apply to all cells in this column except header
            for (let row = 2; row <= this.people.length + 1; row++) {
              const cell = worksheet.getCell(`${colLetter}${row}`);
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: isHoliday ? 'FFEEEE' : 'EEEEEE' } // Light pink for holidays
              };
            }

            // Style the header cell differently for Saturday, Sunday and holidays
            const headerCell = worksheet.getCell(`${colLetter}1`);

            if (isHoliday) {
              // Keep original holiday styling
              headerCell.note = name; // Add holiday name as note/comment
              const headerText = headerCell.value?.toString() || '';
              headerCell.value = headerText + '★';
              headerCell.font = {
                color: { argb: 'FFCC0000' }, // Red text for holidays
                bold: true
              };
            } else if (isSaturday) {
              // Green background for Saturday headers
              headerCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '009900' } // Green background
              };
              headerCell.font = {
                color: { argb: 'FFFFFF' }, // White text
                bold: true
              };
            } else if (isSunday) {
              // Red background for Sunday headers
              headerCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'CC0000' } // Red background
              };
              headerCell.font = {
                color: { argb: 'FFFFFF' }, // White text
                bold: true
              };
            }
          }
        }

        // Auto-size columns
        worksheet.columns.forEach((column) => {
          column.width = 12;
        });
        worksheet.getColumn(1).width = 20; // Name column width
        worksheet.getColumn(1).alignment = { horizontal: 'left' }; // Align name column to the left

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        this.downloadFile(blob, this.getFilename('xlsx'));
        this.showExportMenu = false;
        addNotification('Harmonogram zapisany jako Excel', 'green');
      } catch (error) {
        console.error('Error exporting Excel:', error);
        addNotification('Błąd podczas eksportu do Excel', 'red');
      }
    },

    downloadFile(blob, filename) {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    getDaysInMonth() {
      return new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    },

    getFormattedShift(personId, day, separator = '\n') {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      return getFormattedShift(personId, date, separator);
    },

    isWeekendOrHoliday(day) {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      return isWeekendOrHoliday(date);
    },

    checkMobileView() {
      this.isMobileView = window.innerWidth <= 768;
    }
  }
};
</script>

<style scoped>
.export-container {
  position: relative;
}

.export-button {
  position: relative;
  top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}

/* Desktop positions for opened menu */
.excel-position {
  left: 128px;
}

.calendar-position {
  left: 102px;
}

/* Mobile positions for opened menu */
@media (max-width: 768px) {
  .mobile-excel {
    left: 118px;
  }

  .mobile-calendar {
    left: 92px;
  }
}

.export-icon {
  transition: transform 0.2s ease;
}

/* Export Menu Styles */
.export-menu {
  position: absolute;
  top: calc(100% + 52px);
  background-color: #0a3c3c;
  border: 1px solid #1e5e5e;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  width: 180px;
  z-index: var(--z-index-modal);
  overflow: hidden;
  animation: stretchFromTop 0.25s ease;
  transform-origin: top center;
}
@keyframes stretchFromTop {
  from {
    opacity: 0;
    transform: scaleY(0);
    transform-origin: top center;
  }
  to {
    opacity: 1;
    transform: scaleY(1);
    transform-origin: top center;
  }
}

.export-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s;
}

.export-option:hover {
  background-color: #1e5e5e;
}

.export-option svg {
  margin-right: 10px;
  flex-shrink: 0;
}

.export-option span {
  flex-grow: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (hover: none) {
  .export-button:active {
    transform: none !important;
    background-color: var(--glass-bg-color) !important;
    border-color: var(--glass-border-color) !important;
  }
}

.exporting {
  background-color: white !important;
  color: #333 !important;
  border-color: #ccc !important;
}

.exporting th,
.exporting td {
  border-color: #ccc !important;
}

.exporting-in-progress {
  overflow: hidden !important;
}

.exporting-in-progress * {
  break-inside: avoid;
}

.exporting {
  background-color: white !important;
  color: #333 !important;
  border-color: #ccc !important;
}

.exporting th,
.exporting td {
  border-color: #ccc !important;
  border-width: 1px !important;
  border-style: solid !important;
  padding: 4px !important;
}
</style>
