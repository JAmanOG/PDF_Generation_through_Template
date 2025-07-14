import { useEffect, useState, useCallback, useMemo } from "react";
import { 
   Grid, Card, CardContent, Button, 
  Typography, Box, RadioGroup, FormControlLabel, Radio, Alert, 
  Snackbar, CircularProgress, Paper, 
   Stack, Avatar, Fade, Backdrop 
} from "@mui/material";
import { Download, Refresh, PictureAsPdf, 
  Edit, Business, 
  DesignServices, DocumentScanner,
} from "@mui/icons-material";
import { PDFDocument, PDFName } from "pdf-lib";
import PDFFormTemplate from "./PDFFormTemplate";
import { styled } from "@mui/material/styles";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { jsPDF } from "jspdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   'pdfjs-dist/build/pdf.worker.min.mjs',
//   import.meta.url,
// ).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs?worker';

const templates = [
  {
    id: "template1",
    name: "Template 1",
    preview: "/placeholder.svg?height=400&width=300",
    description: "Contains 2 images and 6 text fields",
    path: "/flyer-assignment-template1.pdf",
    color: "#2563eb",
    icon: <Business />,
  },
  {
    id: "template2",
    name: "Template 2",
    preview: "/placeholder.svg?height=400&width=300",
    description: "Contains 2 image and 5 text fields",
    path: "/flyer-assignment-template2.pdf",
    color: "#dc2626",
    icon: <DesignServices />,
  },
];

const StyledCard = styled(Card)(({ theme, selected, templatecolor }) => ({
  cursor: "pointer",
  border: `2px solid ${selected ? templatecolor : theme.palette.divider}`,
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  transform: selected ? "translateY(-4px)" : "translateY(0)",
  background: selected
    ? `linear-gradient(135deg, ${templatecolor}08 0%, ${templatecolor}04 100%)`
    : "white",
  boxShadow: selected
    ? `0 12px 24px ${templatecolor}20, 0 8px 16px ${templatecolor}10`
    : theme.shadows[1],
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 12px 24px ${templatecolor}20, 0 8px 16px ${templatecolor}10`,
    borderColor: templatecolor,
  },
}));

export default function PDFCustomizationApp() {
  const [formData, setFormData] = useState({
    template: "template1",
    mainHeadline: "",
    feature2: "",
    feature3: "",
    feature4: "",
    feature5: "",
    description: "",
    mainBackground: null,
    logoTlAfImage: null,
    logoRbAfImage: null,
  });

  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfBytes, setPdfBytes] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const selectedTemplate = useMemo(() => 
    templates.find((t) => t.id === formData.template), 
    [formData.template]
  );

  useEffect(() => {
    const fetchFormFields = async () => {
      try {
        const selectedTemplate = templates.find(
          (t) => t.id === formData.template
        );
        if (!selectedTemplate) return;

        const response = await fetch(selectedTemplate.path);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const form = pdfDoc.getForm();
        const fields = form.getFields();

        const formFields = fields.map((field) => {
          const fieldName = field.getName();
          const tempfieldType = field.constructor?.name || "Unknown";
          const fieldType = tempfieldType.replace(/\d+/g, "");
          return {
            name: fieldName,
            type: fieldType,
          };
        });

        // console.log("Form fields retrieved:", formFields);
        setFields(formFields);
      } catch (error) {
        console.error("Error fetching form fields:", error);
        setSnackbar({
          open: true,
          message: "Failed to retrieve form fields. Please try again.",
          severity: "error",
        });
      }
    };

    if (formData.template) {
      fetchFormFields();
    }
  }, [formData.template]);

  const fileToArrayBuffer = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const generatePdfPreview = useCallback(async (returnBytes = false) => {
    if (!selectedTemplate || fields.length === 0) {
      setPdfBytes(null);
      return;
    }

    try {
      setPdfGenerating(true);
      
      const response = await fetch(selectedTemplate.path);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];


      for (const field of fields) {
        const value = formData[field.name];
        
        if (!value) continue;

        try {
          // Handle text fields
          if (typeof value === "string" && value.trim()) {
            const textField = form.getTextField(field.name);
            if (textField) {
              textField.setText(value);
            }
          } 
          // Handle image fields
          else if (value instanceof File) {
            const imageBytes = await fileToArrayBuffer(value);
            let image;
            
            if (value.type === 'image/jpeg' || value.type === 'image/jpg') {
              image = await pdfDoc.embedJpg(imageBytes);
            } else if (value.type === 'image/png') {
              image = await pdfDoc.embedPng(imageBytes);
            } else {
              console.warn(`Unsupported image type: ${value.type}`);
              continue;
            }

            const formField = form.getField(field.name);
            if (!formField) {
              console.warn(`Form field ${field.name} not found`);
              continue;
            }

            try {
              const buttonField = form.getButton(field.name);
              if (buttonField) {
                buttonField.setImage(image);
                console.log(`Set image for button field: ${field.name}`);
              }
            } catch (buttonError) {
              console.log(`Field ${field.name} is not a button, using manual drawing`);
              
              // Fallback to manual drawing using widget position
              const widgets = formField.acroField.getWidgets();
              if (widgets && widgets.length > 0) {
                const rect = widgets[0].getRectangle();
                const x = rect.x;
                const y = rect.y;
                const width = rect.width;
                const height = rect.height;

                firstPage.drawImage(image, {
                  x,
                  y,
                  width,
                  height,
                });

                console.log(`Drew image at (${x}, ${y}) with dimensions ${width}x${height}`);
              }
            }
          }
        } catch (fieldError) {
          console.warn(`Error processing field ${field.name}:`, fieldError);
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
        setPdfBytes(modifiedPdfBytes);
      
      
      // return modifiedPdfBytes;
        
    } catch (error) {
      console.error("Error generating PDF preview:", error);
      if (!returnBytes) {
        setPdfBytes(null);
        setSnackbar({
          open: true,
          message: "Error generating PDF preview",
          severity: "error",
        });
      }
      } finally {
      setPdfGenerating(false);
    }
  }, [selectedTemplate, fields, formData, fileToArrayBuffer]);

  useEffect(() => { 
    const debounceTimer = setTimeout(() => {
      generatePdfPreview();
    }, 1500);
    
    return () => clearTimeout(debounceTimer);
  }, [generatePdfPreview]);

  const handleFieldChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const handleTemplateChange = useCallback((templateId) => {
    setFormData((prev) => ({ ...prev, template: templateId }));
    setPdfBytes(null);
  }, []);

  const handleReset = useCallback(() => {
    setFormData({
      template: "template1",
      mainHeadline: "",
      feature2: "",
      feature3: "",
      feature4: "",
      feature5: "",
      mainBackground: null,
      logoTlAfImage: null,
      logoRbAfImage: null,
    });
    setPdfBytes(null);
    setSnackbar({
      open: true,
      message: "Form reset successfully!",
      severity: "success",
    });
  }, []);

  const handleGeneratePDF = async () => {
    const canvas = document.querySelector(".react-pdf__Page__canvas");

    if (!canvas) {
      alert("Canvas not found.");
      return;
    }

    const originalWidth = canvas.width;
    const originalHeight = canvas.height;

    const scaleFactor = 2; 
    const Canvas = document.createElement("canvas");
    Canvas.width = originalWidth * scaleFactor;
    Canvas.height = originalHeight * scaleFactor;

    const ctx = Canvas.getContext("2d");
    ctx.scale(scaleFactor, scaleFactor);

    ctx.drawImage(canvas, 0, 0);

    const imgData = Canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [originalWidth, originalHeight],
    });

    pdf.addImage(imgData, "PNG", 0, 0, originalWidth, originalHeight);
    pdf.save("Template_generated.pdf");
  }

  const handleFormSubmit = () => {
    handleGeneratePDF();
  };

  const PDFPreviewComponent = useMemo(() => {
    if (pdfGenerating) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Generating preview...
          </Typography>
        </Box>
      );
    }

    if (!pdfBytes || pdfBytes.byteLength === 0) {
      return (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Fill out the form to see live preview
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'grey.50',
        justifyItems: 'center',
      }}>
        <Document
          file={{ data: pdfBytes }}
          onLoadError={(error) => {
            console.error("PDF load error:", error);
            setSnackbar({
              open: true,
              message: "Error loading PDF preview",
              severity: "error",
            });
          }}
          loading={
            <Box sx={{ textAlign: "center", py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Loading preview...
              </Typography>
            </Box>
          }
        >
          <Page 
            pageNumber={1}
            scale={0.8}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </Box>
    );
  }, [pdfBytes, pdfGenerating]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        position: "relative",
      }}
    >
      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(8px)",
        }}
        open={loading}
      >
        <Stack spacing={3} alignItems="center">
          <Box sx={{ position: "relative" }}>
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: "#3b82f6",
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DocumentScanner sx={{ fontSize: 32, color: "#3b82f6" }} />
            </Box>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "white" }}>
            Generating PDF...
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Please wait while we process your document
          </Typography>
        </Stack>
      </Backdrop>

      <Grid container spacing={4} sx={{ px: 2, py: 4 }}>
        {/* Left Panel - Form */}
        <Grid item xs={12} lg={4} height="100%" width={"60%"}>
          <Paper
            elevation={0}
            sx={{
              height: "100%",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              background: "white",
            }}
          >
            {/* Form Header with Progress */}
            <Box
              sx={{
                p: 3,
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "white",
                position: "relative",
              }}
            >
              <Stack spacing={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Edit sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Document Builder
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Complete the form to generate your professional document
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            {/* Form Content */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                maxHeight: "calc(100vh - 265px)",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f5f9",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#cbd5e1",
                  borderRadius: "10px",
                  "&:hover": {
                    background: "#94a3b8",
                  },
                },
              }}
            >
              {fields.length > 0 ? (
                <Fade in timeout={500}>
                  <Box sx={{ p: 3 }}>
                    <PDFFormTemplate
                      fields={fields}
                      formData={formData}
                      onFieldChange={handleFieldChange}
                      onSubmit={handleFormSubmit}
                    />
                  </Box>
                </Fade>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "400px",
                    textAlign: "center",
                    p: 4,
                  }}
                >
                  <Stack spacing={3} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 80,
                        height: 80,
                        opacity: 0.8,
                      }}
                    >
                      <DocumentScanner sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Select a Template
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ maxWidth: 400 }}
                    >
                      Choose a PDF template from the right panel to
                      automatically load the form fields and start building your
                      document
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Box>

            {/* Form Actions */}
            <Box
              sx={{
                p: 3,
                borderTop: "1px solid",
                borderColor: "divider",
                background: "#f8fafc",
              }}
            >
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<Refresh />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 500,
                    px: 3,
                    py: 1.5,
                  }}
                >
                  Reset Form
                </Button>
                <Button
                  variant="contained"
                  onClick={handleFormSubmit}
                  startIcon={<Download />}
                  disabled={loading || fields.length === 0}
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    },
                  }}
                >
                  Generate PDF
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* Right Panel - Templates & Preview */}
        <Grid item xs={12} lg={4} width={"35%"} height="100%">
          <Stack spacing={3}>
            {/* Template Selection */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                background: "white",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 48,
                      height: 48,
                    }}
                  >
                    <PictureAsPdf sx={{ fontSize: 24 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Templates
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Choose your preferred layout
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ p: 3 }}>
                <RadioGroup
                  value={formData.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                >
                  <Stack spacing={2}>
                    {templates.map((template) => (
                      <StyledCard
                        key={template.id}
                        selected={formData.template === template.id}
                        templatecolor={template.color}
                        onClick={() => handleTemplateChange(template.id)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="flex-start"
                          >
                            <Avatar
                              sx={{
                                bgcolor: template.color,
                                width: 56,
                                height: 56,
                                flexShrink: 0,
                              }}
                            >
                              {template.icon}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <FormControlLabel
                                value={template.id}
                                control={
                                  <Radio
                                    sx={{
                                      color: template.color,
                                      "&.Mui-checked": {
                                        color: template.color,
                                      },
                                      alignSelf: "flex-start",
                                      mt: -1,
                                    }}
                                  />
                                }
                                label={
                                  <Stack spacing={2} sx={{ width: "100%" }}>
                                    <Box>
                                      <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600, mb: 0.5 }}
                                      >
                                        {template.name}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {template.description}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                }
                                sx={{ m: 0, alignItems: "flex-start" }}
                              />
                            </Box>
                          </Stack>
                        </CardContent>
                      </StyledCard>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>
            </Paper>

            {/* Live PDF Preview */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
                background: "white",
              }}
            >
              <Box sx={{ p: 3 }}>{PDFPreviewComponent}</Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            "& .MuiAlert-message": {
              fontWeight: 500,
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}