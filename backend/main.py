from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# c = canvas.Canvas("example.pdf", pagesize=letter)
# c.drawString(100, 750, "Welcome to ReportLab!")
# form = c.acroForm
# form.textfield(name='name', tooltip='Enter your name', x=100, y=700, width=300, height=20)
# form.textfield(name='email', tooltip='Enter your email', x=100, y=670, width=300, height=20)
# form.checkbox(name='subscribe', tooltip='Subscribe to newsletter', x=100, y=640, size=20)
# c.save()

from pdfrw import PdfWriter, PdfReader, PageMerge

existing_pdf = PdfReader("Aman_jaiswal_Resume.pdf")
overlay_pdf = PdfReader("overlay.pdf")

if existing_pdf.pages is not None and overlay_pdf.pages is not None:
    for page, overlay_page in zip(existing_pdf.pages, overlay_pdf.pages):
        merger = PageMerge(page)
        merger.add(overlay_page).render()
    PdfWriter("merged_output.pdf", trailer=existing_pdf).write()
else:
    raise ValueError("One of the PDF files does not contain any pages.")