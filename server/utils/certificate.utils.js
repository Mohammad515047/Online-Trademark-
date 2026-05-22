const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateQRCode = async (data) => {
  try {
    const filename = `qr-${Date.now()}.png`;
    const filepath = path.join(__dirname, '../uploads/qrcodes', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await QRCode.toFile(filepath, data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return `/uploads/qrcodes/${filename}`;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

const generatePDF = async (certificateData) => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `cert-${certificateData.tmNumber}-${Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../uploads/certificates', filename);
      
      // Ensure directory exists
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      });

      doc.pipe(fs.createWriteStream(filepath));

      // Header
      doc.fontSize(20).font('Helvetica-Bold')
        .text('Government of the People\'s Republic of Bangladesh', { align: 'center' });
      
      doc.fontSize(14).font('Helvetica')
        .text('Department of Patents, Designs and Trade Marks (DPDT)', { align: 'center' });
      
      doc.fontSize(12)
        .text('Ministry of Industries, Shilpa Bhaban', { align: 'center' })
        .text('91, Motijheel C/A, Dhaka-1000', { align: 'center' });

      doc.moveDown(1);

      // Certificate Title
      doc.fontSize(16).font('Helvetica-Bold')
        .text('Certificate of Registration of Trademark [Rule 30(1)]', { align: 'center' });

      doc.moveDown(1);

      // Certificate Details
      doc.fontSize(11).font('Helvetica');
      
      doc.text(`Certificate No: ${certificateData.certificateNumber}`, 50);
      doc.text(`Serial No: ${certificateData.serialNumber}`, 350);
      
      doc.moveDown(0.5);
      
      doc.text(`Trademark No: ${certificateData.tmNumber}`, 50);
      doc.text(`Date: ${new Date(certificateData.registrationDate).toLocaleDateString()}`, 350);

      doc.moveDown(1);

      // Body Text
      doc.fontSize(10).font('Helvetica');
      doc.text('Certified that the Trademark of which a representation is annexed hereto has been registered in the name of:', { align: 'left' });
      
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica-Bold')
        .text(certificateData.ownerName, { align: 'center' });
      
      doc.fontSize(10).font('Helvetica')
        .moveDown(0.5)
        .text(`Company: ${certificateData.companyName || 'N/A'}`, { align: 'left' })
        .text(`Address: ${certificateData.ownerAddress || 'N/A'}`, { align: 'left' })
        .text(`Class: ${certificateData.class || 'N/A'}`, { align: 'left' })
        .text(`Service/Goods: ${certificateData.serviceDescription || 'N/A'}`, { align: 'left' });

      doc.moveDown(1);

      // Signature Section
      doc.text('Sealed at my direction this _____ day of _____________________ ', { align: 'left' });
      doc.moveDown(0.5);
      doc.text(`Date: ${new Date(certificateData.sealingDate).toLocaleDateString()}`, { align: 'left' });
      
      doc.moveDown(1);
      
      doc.fontSize(11).font('Helvetica-Bold')
        .text(certificateData.signatory || 'Authorized Signatory', { align: 'right' })
        .fontSize(10).font('Helvetica')
        .text(certificateData.designationOfSignatory || 'Director General', { align: 'right' });

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica')
        .text('Registration is valid for 7 years from the above-mentioned date and may be renewed for a period of 10 years.', { align: 'center' })
        .text('This registration is subject to the provisions of the Trademarks Act, 2009.', { align: 'center' });

      doc.end();

      doc.on('finish', () => {
        resolve(`/uploads/certificates/${filename}`);
      });

      doc.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateQRCode,
  generatePDF
};
