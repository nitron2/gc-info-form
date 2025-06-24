const express = require('express');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8971;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('cors')());



const filePath = path.join(__dirname, 'form_submissions.xlsx');


app.post('/submit', async (req, res) => {
  const data = req.body;
  data.timestamp = new Date().toISOString();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet('Submissions');

  if (!worksheet) {
    return res.status(500).json({ message: 'Worksheet "Submissions" not found.' });
  }

  // ✅ Extract column keys from the first row (headers)
  const headerRow = worksheet.getRow(1);
  const columnKeys = headerRow.values
    .slice(1) // skip Excel's empty index 0
    .map(v => String(v).trim());

  console.log('Detected column keys from header:', columnKeys);

  // ✅ Build row in correct order
  const row = columnKeys.map(key => data[key] || '');

  worksheet.addRow(row);
  await workbook.xlsx.writeFile(filePath);

  res.json({ message: 'Submission saved successfully!' });
});

// Fallback route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});



