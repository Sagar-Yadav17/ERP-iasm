const PDFDocument = require('pdfkit');

const generateInvoicePDF = (invoice, res) => {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=Invoice-${invoice.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  const subtotal = Number(invoice.subtotal || 0);
  const tax = Number(invoice.tax || 0);
  const total = Number(invoice.total || invoice.totalAmount || 0);

  // ==========================
  // COMPANY HEADER
  // ==========================
  doc
    .fillColor('#4F46E5')
    .fontSize(24)
    .text('ZUBRON SYSTEMS', 50, 50);

  doc
    .fillColor('#666')
    .fontSize(10)
    .text('Meerut, Uttar Pradesh', 50, 80)
    .text('support@zubron.com', 50, 95);

  doc
    .fillColor('#000')
    .fontSize(20)
    .text('INVOICE', 400, 50);

  doc
    .fontSize(10)
    .text(`Invoice #: ${invoice.invoiceNumber}`, 380, 85)
    .text(
      `Date: ${
        invoice.createdAt
          ? new Date(invoice.createdAt).toLocaleDateString('en-IN')
          : '-'
      }`,
      380,
      100
    )
    .text(
      `Due Date: ${
        invoice.dueDate
          ? new Date(invoice.dueDate).toLocaleDateString('en-IN')
          : '-'
      }`,
      380,
      115
    );

  doc.moveTo(50, 145).lineTo(550, 145).stroke('#4F46E5');

  // ==========================
  // BILL TO
  // ==========================
  doc
    .fillColor('#4F46E5')
    .fontSize(12)
    .text('Bill To', 50, 165);

  doc
    .fillColor('#000')
    .fontSize(11)
    .text(invoice.clientName || '-', 50, 185)
    .text(invoice.clientEmail || '-', 50, 200);

  // ==========================
  // STATUS
  // ==========================
  const statusColor =
    invoice.status === 'paid'
      ? '#10B981'
      : invoice.status === 'overdue'
      ? '#EF4444'
      : '#F59E0B';

  doc.roundedRect(430, 170, 90, 28, 5).fill(statusColor);

  doc
    .fillColor('#fff')
    .fontSize(11)
    .text((invoice.status || 'draft').toUpperCase(), 430, 178, {
      width: 90,
      align: 'center',
    });

  // ==========================
  // TABLE HEADER
  // ==========================
  let y = 250;

  doc.fillColor('#f3f4f6').rect(50, y, 500, 25).fill();

  doc.fillColor('#000').fontSize(10);

  doc.text('Description', 60, y + 8);
  doc.text('Qty', 300, y + 8);
  doc.text('Rate', 380, y + 8);
  doc.text('Amount', 470, y + 8);

  y += 35;

  // ==========================
  // ITEMS
  // ==========================
  (invoice.items || []).forEach((item, index) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.rate || item.price || 0);
    const amount = qty * rate;

    if (index % 2 === 0) {
      doc.fillColor('#fafafa').rect(50, y - 3, 500, 22).fill();
    }

    doc.fillColor('#000').fontSize(10);

    doc.text(item.description || '-', 60, y);
    doc.text(qty.toString(), 300, y);
    doc.text(`₹${rate.toLocaleString()}`, 380, y);
    doc.text(`₹${amount.toLocaleString()}`, 470, y);

    y += 25;
  });

  // ==========================
  // TOTALS
  // ==========================
  y += 20;

  doc.moveTo(300, y).lineTo(550, y).stroke('#ccc');

  y += 15;

  doc.fillColor('#000').fontSize(10);
  doc.text('Subtotal:', 350, y);
  doc.text(`₹${subtotal.toLocaleString()}`, 470, y);

  y += 20;

  doc.text(`Tax (${tax}%):`, 350, y);
  doc.text(`₹${((subtotal * tax) / 100).toLocaleString()}`, 470, y);

  y += 30;

  doc.fillColor('#4F46E5').fontSize(14);
  doc.text('Grand Total:', 350, y);

  // FIXED: only ONE total printed
  doc.text(`₹${total.toLocaleString()}`, 470, y);

  // ==========================
  // NOTES
  // ==========================
  if (invoice.notes) {
    y += 50;

    doc.fillColor('#000').fontSize(11);
    doc.text('Notes', 50, y);

    doc.fillColor('#666').fontSize(10);
    doc.text(invoice.notes, 50, y + 20, {
      width: 450,
    });

    y += 60;
  }

  // ==========================
  // THANK YOU MESSAGE
  // ==========================
  y += 60;

  doc.moveTo(50, y).lineTo(550, y).stroke('#E5E7EB');

  y += 20;

  doc
    .fillColor('#666')
    .fontSize(10)
    .text(
      'Thank you for your business!',
      50,
      y,
      {
        width: 500,
        align: 'center',
      }
    );

  doc.end();
};

module.exports = { generateInvoicePDF };