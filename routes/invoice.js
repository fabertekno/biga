const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoices");

// Create a new invoice
router.post("/", async (req, res) => {
    try {
        const { customerId, date, items, totalAmount } = req.body;

        const invoice = new Invoice({
            customer: customerId,
            date,
            items,
            totalAmount,
        });

        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ error: "Failed to create invoice" });
    }
});

// Fetch all invoices for a customer
router.get("/", async (req, res) => {
    try {
        const customerId = req.query.customerId;

        if (!customerId) {
            return res.status(400).json({ error: "Customer ID is required" });
        }

        const invoices = await Invoice.find({ customer: customerId });
        res.json(invoices);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ error: "Failed to fetch invoices" });
    }
});

// Fetch a single invoice by ID
router.get("/:id", async (req, res) => {
    try {
        const invoiceId = req.params.id;

        // Find the invoice by ID
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.json(invoice);
    } catch (error) {
        console.error("Error fetching invoice:", error);
        res.status(500).json({ error: "Failed to fetch invoice" });
    }
});
// Fetch a single invoice by ID and send PDF
router.get("/:id/pdf", async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const filePath = path.join(__dirname, 'invoices', `invoice_${invoiceId}.pdf`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "PDF file not found" });
        }

        const mode = req.query.mode || 'download';  // "inline" for print, "download" for download

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/pdf');

        // Adjust the disposition based on the mode
        if (mode === 'inline') {
            res.setHeader('Content-Disposition', `inline; filename=invoice_${invoiceId}.pdf`);
        } else {
            res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoiceId}.pdf`);
        }

        // Send the file as a response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error("Error fetching invoice PDF:", error);
        res.status(500).json({ error: "Failed to fetch invoice PDF" });
    }
});




router.put("/:id", async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const updates = req.body;

        const updatedInvoice = await Invoice.findByIdAndUpdate(invoiceId, updates, { new: true });

        if (!updatedInvoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.json(updatedInvoice);
    } catch (error) {
        console.error("Error updating invoice:", error);
        res.status(500).json({ error: "Failed to update invoice" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const invoiceId = req.params.id;

        const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId);

        if (!deletedInvoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        res.json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        res.status(500).json({ error: "Failed to delete invoice" });
    }
});

const PDFDocument = require("pdfkit");
const path = require("path");

router.get("/:id/pdf", async (req, res) => {
    try {
        const invoiceId = req.params.id;
        const invoice = await Invoice.findById(invoiceId)
            .populate('customer')
            .lean();

        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        // Create PDF with optimized margins
        const doc = new PDFDocument({ 
            margin: 40,
            size: 'A4'
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=invoice_${invoiceId}.pdf`);
        doc.pipe(res);

        // 1. INVOICE HEADER
        doc.fontSize(22)
           .font("Helvetica-Bold")
           .text("INVOICE", { align: "center", y: 40 })
           .moveDown(0.5);

        // 2. LOGO AND COMPANY INFO
        const logoWidth = 130;
        const headerY = 140;
        
        // Logo on left
        doc.image(path.join(__dirname, 'logo.png'), 40, headerY, { 
    width: logoWidth
});

// COMPANY INFO (RIGHT SIDE) - WITH PROPER SPACING
const companyInfoX = doc.page.width - 200;
doc.fontSize(14) // Increased font size for company name
   .font("Helvetica-Bold")
   .text("BigA Company", companyInfoX, headerY)
   
   .fontSize(10) // Reset font size for other text
   .font("Helvetica")
   .text("Bahrka Road, Behind Balisany Mosque 44001 Erbil, Iraq", companyInfoX, headerY + 20)
   
   // Divider line after address
   .moveTo(companyInfoX, headerY + 38)
   .lineTo(companyInfoX + 160, headerY + 38)
   .lineWidth(0.5)
   .stroke("#CCCCCC")
   
   // Phone (bold label + regular number on same line)
   .font("Helvetica-Bold")
   .text("Phone: ", companyInfoX, headerY + 45, { continued: true })
   .font("Helvetica")
   .text("+964 751 877 6700", { continued: false })
   
   // Email (bold label + regular address on same line, closer spacing)
   .font("Helvetica-Bold")
   .text("Email: ", companyInfoX, headerY + 58, { continued: true }) // Reduced spacing
   .font("Helvetica")
   .text("info@bigasoft.org");
 
       // 3. CUSTOMER AND INVOICE INFO - WITH ADDED SPACING
const infoSectionY = headerY + 120; // Increased from 70 to prevent overlap

// Customer info (left)
doc.fontSize(10)
   .font("Helvetica-Bold")
   .text("Customer:", 40, infoSectionY, { underline: true }) 
   .font("Helvetica") // Reset to normal for customer details
   .text(invoice.customer?.customerName || "Not Provided", 40, infoSectionY + 20)
   .text(invoice.customer?.address || "Not Provided", 40, infoSectionY + 35)

   // Bold labels for phone and email
   .font("Helvetica-Bold")
   .text("Phone: ", 40, infoSectionY + 50, { continued: true })
   .font("Helvetica")
   .text(invoice.customer?.phone || "Not Provided")

   .font("Helvetica-Bold")
   .text("Email: ", 40, infoSectionY + 65, { continued: true })
   .font("Helvetica")
   .text(invoice.customer?.email || "Not Provided");


        // Invoice details (right)
        const invoiceDate = invoice.date ? new Date(invoice.date).toLocaleDateString() : new Date().toLocaleDateString();
        doc.font("Helvetica-Bold")
           .text("INVOICE DETAILS:", companyInfoX, infoSectionY, { underline: true })
           .font("Helvetica")
           .text(`Invoice #: ${invoice._id}`, companyInfoX, infoSectionY + 20)
           
           // Divider line
           .moveTo(companyInfoX, infoSectionY + 35)
           .lineTo(companyInfoX + 150, infoSectionY + 35)
           .lineWidth(0.5)
           .stroke("#cccccc")
           
           .text(`Date: ${invoiceDate}`, companyInfoX, infoSectionY + 45)
           .text(`Due Date: ${invoiceDate}`, companyInfoX, infoSectionY + 60);

        // 4. ITEMS TABLE (unchanged from your working version)
        const tableStartY = infoSectionY + 90;
        const tableWidth = doc.page.width - 80;
        const descWidth = tableWidth * 0.5 - 20;
        const qtyWidth = tableWidth * 0.15 - 20;
        const priceWidth = tableWidth * 0.15 - 20;
        const totalWidth = tableWidth * 0.2 - 20;
        const descX = 50;
        const qtyX = descX + descWidth + 20;
        const priceX = qtyX + qtyWidth + 20;
        const totalX = priceX + priceWidth + 20;

        // Table header
        doc.rect(40, tableStartY - 5, tableWidth, 20)
           .fill("#333333")
           .fillColor("#ffffff")
           .font("Helvetica-Bold")
           .fontSize(10)
           .text("Description", descX, tableStartY, { width: descWidth })
           .text("Qty", qtyX, tableStartY, { width: qtyWidth, align: "center" })
           .text("Unit Price", priceX, tableStartY, { width: priceWidth, align: "right" })
           .text("Total", totalX, tableStartY, { width: totalWidth, align: "right" });

        // Table rows
        const items = invoice.items || [];
        let currentY = tableStartY + 25;
        
        items.forEach((item, index) => {
            const quantity = item.quantity || 1;
            const unitPrice = item.price || (item.total / quantity) || 0;
            const total = item.total || (unitPrice * quantity);
            
            doc.rect(40, currentY - 5, tableWidth, 20)
               .fill(index % 2 === 0 ? "#f8f8f8" : "#ffffff")
               .fillColor("#000000")
               .font("Helvetica")
               .fontSize(10)
               .text(item.description || "Item", descX, currentY, { width: descWidth })
               .text(quantity.toString(), qtyX, currentY, { width: qtyWidth, align: "center" })
               .text(`$${unitPrice.toFixed(2)}`, priceX, currentY, { width: priceWidth, align: "right" })
               .text(`$${total.toFixed(2)}`, totalX, currentY, { width: totalWidth, align: "right" });
            
            currentY += 20;
            
            if (currentY > doc.page.height - 100 && index < items.length - 1) {
                doc.addPage();
                currentY = 50;
                // Redraw headers on new page
                doc.rect(40, currentY - 5, tableWidth, 20)
                   .fill("#333333")
                   .fillColor("#ffffff")
                   .font("Helvetica-Bold")
                   .text("Description", descX, currentY, { width: descWidth })
                   .text("Qty", qtyX, currentY, { width: qtyWidth, align: "center" })
                   .text("Unit Price", priceX, currentY, { width: priceWidth, align: "right" })
                   .text("Total", totalX, currentY, { width: totalWidth, align: "right" });
                currentY += 25;
            }
        });

        // 5. TOTAL SECTION
        const totalY = Math.min(currentY + 10, doc.page.height - 100);
        doc.rect(40, totalY, tableWidth, 30)
           .fillAndStroke("#e6e6e6", "#333333")
           .font("Helvetica-Bold")
           .fontSize(12)
           .fillColor("#000000")
           .text("TOTAL AMOUNT:", totalX - 100, totalY + 10, { width: 100, align: "right" })
           .text(`$${(invoice.totalAmount || 0).toFixed(2)}`, totalX, totalY + 10, { width: totalWidth, align: "right" });


        doc.end();
    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});
module.exports = router;
