import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    Chip,
    Alert,
    Card,
    CardContent,
    Stack,
    Avatar,
    Fade,
    
} from '@mui/material';
import {
    CloudUpload,
    Image as ImageIcon,
    CheckCircle,
    Delete,
    Preview,
} from '@mui/icons-material';
import { getFieldIcon,renderTextField,formatFieldName,isImageField,renderCheckBox,renderDropdown,renderOptionList,renderRadioGroup } from './template_config';

const PDFFormTemplate = React.memo(({ fields, formData, onFieldChange, onSubmit }) => {
    const [validationErrors, setValidationErrors] = useState({});

    //  image preview component 
    const ImagePreview = React.memo(({ file, fieldName, onRemove }) => {
        const [imageUrl, setImageUrl] = useState(null);
        const [imageError, setImageError] = useState(false);

        const fileRef = React.useRef(null);

        React.useEffect(() => {
            if (file && file !== fileRef.current) {
                const url = URL.createObjectURL(file);
                setImageUrl(url);
                setImageError(false);
                fileRef.current = file;
                // Cleanup function
                return () => {
                    if (imageUrl && (!file || file !== fileRef.current)) {
                        URL.revokeObjectURL(imageUrl);
                    }
                };
            } else {
                setImageUrl(null);
                setImageError(false);
                fileRef.current = null;
            }
        }, [file]);

        if (!file || !imageUrl || imageError) return null;

        return (
            <Fade in={!!file}>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <Chip
                            size="small"
                            label={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            color="info"
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            label={file.type.split('/')[1]?.toUpperCase() || 'IMG'}
                            color="success"
                            variant="outlined"
                        />
                        <Button
                            size="small"
                            color="error"
                            onClick={onRemove}
                            startIcon={<Delete />}
                            sx={{ textTransform: 'none' }}
                        >
                            Remove
                        </Button>
                    </Stack>
                    
                    <Box sx={{ 
                        position: 'relative',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: 'success.main',
                        backgroundColor: 'grey.50',
                        boxShadow: 1,
                    }}>
                        <img
                            src={imageUrl}
                            alt={fieldName}
                            style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                            onError={(e) => {
                                console.error('Image load error:', e);
                                setImageError(true);
                            }}
                            onLoad={() => setImageError(false)}
                        />
                        <Box sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                        }}>
                            {file.name}
                        </Box>
                    </Box>
                </Box>
            </Fade>
        );
    });

    //  image upload component 
    const renderImageUpload = useCallback((field) => {
        const file = formData[field.name];
        const displayName = formatFieldName(field.name);
        
        const handleFileChange = (e) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
                // Validate file type
                if (!selectedFile.type.startsWith('image/')) {
                    setValidationErrors(prev => ({
                        ...prev,
                        [field.name]: 'Please select a valid image file'
                    }));
                    return;
                }
                
                // Validate file size (10MB limit)
                if (selectedFile.size > 10 * 1024 * 1024) {
                    setValidationErrors(prev => ({
                        ...prev,
                        [field.name]: 'File size must be less than 10MB'
                    }));
                    return;
                }
                
                // Clear validation errors
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field.name];
                    return newErrors;
                });
                
                onFieldChange(field.name, selectedFile);
            }
        };

        const handleRemove = useCallback(() => {
            onFieldChange(field.name, null);
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field.name];
                return newErrors;
            });
        }, [field.name, onFieldChange]);
        
        return (
            <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ImageIcon color="primary" fontSize="small" />
                            {displayName}
                        </Typography>
                        
                        {validationErrors[field.name] && (
                            <Alert severity="error" sx={{ borderRadius: 1 }}>
                                {validationErrors[field.name]}
                            </Alert>
                        )}
                        
                        <Button
                            variant={file ? "outlined" : "contained"}
                            component="label"
                            startIcon={file ? <CheckCircle /> : <CloudUpload />}
                            color={file ? "success" : "primary"}
                            sx={{
                                py: 2,
                                borderRadius: 2,
                                textTransform: "none",
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                ...(file && {
                                    borderStyle: "solid",
                                    borderWidth: 2,
                                    borderColor: "success.main",
                                }),
                            }}
                            fullWidth
                        >
                            {file ? `${file.name} selected` : `Choose ${displayName}`}
                            <input
                                type="file"
                                hidden
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleFileChange}
                            />
                        </Button>
                        
                        <ImagePreview 
                            file={file} 
                            fieldName={displayName}
                            onRemove={handleRemove}
                        />
                    </Stack>
                </CardContent>
            </Card>
        );
    }, [formData, onFieldChange, validationErrors]);

    const renderButton = useCallback((field) => {
        if (isImageField(field)) {
            return renderImageUpload(field);
        }
        
        return (
            <Button
                key={field.name}
                variant="contained"
                startIcon={getFieldIcon(field.type)}
                onClick={() => {
                    console.log(`Button clicked: ${field.name}`);
                    if (field.name.toLowerCase().includes('submit')) {
                        onSubmit && onSubmit();
                    }
                }}
                fullWidth
                sx={{ 
                    py: 2,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    boxShadow: 1,
                    '&:hover': {
                        boxShadow: 2,
                    },
                }}
            >
                {formatFieldName(field.name)}
            </Button>
        );
    }, [renderImageUpload, onSubmit]);

    const groupedFields = useMemo(() => {
        const grouped = {};
        fields.forEach(field => {
            let groupKey = field.type;
            
            if (field.type === 'PDFButton' && isImageField(field)) {
                groupKey = 'PDFImageUpload';
            }
            
            if (!grouped[groupKey]) {
                grouped[groupKey] = [];
            }
            grouped[groupKey].push(field);
        });
        return grouped;
    }, [fields]);

    // Main render field function
    const renderField = useCallback((field) => {
        switch (field.type) {
            case 'PDFTextField':
                return renderTextField(field,formData,validationErrors, onFieldChange);
            case 'PDFCheckBox':
                return renderCheckBox(field,formData,onFieldChange);
            case 'PDFRadioGroup':
                return renderRadioGroup(field,formData,onFieldChange);
            case 'PDFDropdown':
                return renderDropdown(field,formData,onFieldChange);
            case 'PDFOptionList':
                return renderOptionList(field,formData,onFieldChange);
            case 'PDFButton':
                return renderButton(field);
            case 'PDFSignature':
                return renderTextField(field,formData,validationErrors,onFieldChange); // Treat as text field for now
            default:
                return renderTextField(field,formData,validationErrors,onFieldChange);
        }
    }, [renderTextField, renderCheckBox, renderRadioGroup, renderDropdown, renderOptionList, renderButton]);

    const getGroupDisplayName = (fieldType) => {
        const names = {
            'PDFImageUpload': 'Image Uploads',
            'PDFTextField': 'Text Fields',
            'PDFCheckBox': 'Checkboxes',
            'PDFRadioGroup': 'Radio Groups',
            'PDFDropdown': 'Dropdowns',
            'PDFOptionList': 'Multi-Select Lists',
            'PDFButton': 'Buttons',
            'PDFSignature': 'Digital Signatures',
        };
        return names[fieldType] || fieldType.replace('PDF', '');
    };

    const getGroupIcon = (fieldType) => {
        if (fieldType === 'PDFImageUpload') {
            return <ImageIcon color="primary" />;
        }
        return getFieldIcon(fieldType);
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                }}
            >
                <Stack spacing={1} sx={{ mb: 4 }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700,
                            color: 'text.primary',
                            letterSpacing: '-0.025em',
                        }}
                    >
                        PDF Form Builder
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Fill out the form fields below to generate your PDF document
                    </Typography>
                </Stack>
                
                <Stack spacing={4}>
                    {Object.entries(groupedFields).map(([fieldType, fieldsOfType]) => (
                        <Card 
                            key={fieldType} 
                            variant="outlined" 
                            sx={{ 
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                overflow: 'hidden',
                            }}
                        >
                            <Box sx={{ 
                                p: 3, 
                                backgroundColor: 'grey.50',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                        {getGroupIcon(fieldType)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                            {getGroupDisplayName(fieldType)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {fieldsOfType.length} field{fieldsOfType.length !== 1 ? 's' : ''}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    {fieldsOfType.map((field) => (
                                        <Grid 
                                            item 
                                            xs={12} 
                                            sm={fieldType === 'PDFCheckBox' ? 6 : 12}
                                            md={
                                                fieldType === 'PDFCheckBox' ? 4 : 
                                                fieldType === 'PDFTextField' ? 6 : 
                                                fieldType === 'PDFImageUpload' ? 6 : 12
                                            }
                                            key={field.name}
                                        >
                                            <Fade in timeout={300}>
                                                <Box>
                                                    {renderField(field)}
                                                </Box>
                                            </Fade>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        </Card>
                    ))}
                </Stack>

                {fields.length === 0 && (
                    <Card variant="outlined" sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
                        <Stack spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: 'info.main', width: 60, height: 60 }}>
                                <Preview />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                No Form Fields Found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                                Please select a different PDF template or upload a PDF document that contains interactive form fields.
                            </Typography>
                        </Stack>
                    </Card>
                )}
            </Paper>
        </Box>
    );
});

PDFFormTemplate.displayName = 'PDFFormTemplate';

export default PDFFormTemplate;