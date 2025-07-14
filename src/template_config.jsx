import React from 'react';
import {
    Box,
    TextField,
    Checkbox,
    FormControlLabel,
    RadioGroup,
    Radio,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    ListItemText,
    OutlinedInput,
    Typography,
    Chip,
    Card,
    Stack,
    
} from '@mui/material';
import {
    
    CloudUpload,
    Image as ImageIcon,
    CheckCircle,
    Delete,
    Preview,
    TextFields,
    CheckBox,
} from '@mui/icons-material';
    
    const getFieldIcon = (fieldType) => {
        const iconProps = { fontSize: 'small', color: 'primary' };
        switch (fieldType) {
            case 'PDFTextField':
                return <TextFields {...iconProps} />;
            case 'PDFCheckBox':
                return <CheckBox {...iconProps} />;
            case 'PDFRadioGroup':
                return <RadioButtonChecked {...iconProps} />;
            case 'PDFDropdown':
                return <ArrowDropDown {...iconProps} />;
            case 'PDFOptionList':
                return <List {...iconProps} />;
            case 'PDFButton':
                return <TouchApp {...iconProps} />;
            case 'PDFSignature':
                return <Security {...iconProps} />;
            default:
                return <TextFields {...iconProps} />;
        }
    };

    const isImageField = (field) => {
        const name = field.name.toLowerCase();
        return (
            name.includes("logo") ||
            name.includes("image") ||
            name.includes("background") ||
            name.includes("picture") ||
            name.includes("photo") ||
            name.includes("banner") ||
            name.includes("icon")
        );
    };

    const formatFieldName = (name) => {
        return name.replace(/([A-Z])/g, ' $1').trim();
    };

    const renderTextField = (field, formData,validationErrors ,onFieldChange) => {
        const isMultiline = field.name.toLowerCase().includes('description') || 
                                             field.name.toLowerCase().includes('comment') || 
                                             field.name.toLowerCase().includes('notes');
        
        return (
            <TextField
                key={field.name}
                label={formatFieldName(field.name)}
                value={formData[field.name] || ''}
                onChange={(e) => onFieldChange(field.name, e.target.value)}
                fullWidth
                variant="outlined"
                multiline={isMultiline}
                rows={isMultiline ? 4 : 1}
                error={!!validationErrors[field.name]}
                helperText={validationErrors[field.name]}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                        },
                    },
                }}
                InputProps={{
                    startAdornment: (
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                            {getFieldIcon(field.type)}
                        </Box>
                    ),
                }}
            />
        );
    };

    const renderCheckBox = (field,formData ,onFieldChange) => {
        return (
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <FormControlLabel
                    key={field.name}
                    control={
                        <Checkbox
                            checked={formData[field.name] || false}
                            onChange={(e) => onFieldChange(field.name, e.target.checked)}
                            color="primary"
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 20 } }}
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatFieldName(field.name)}
                        </Typography>
                    }
                    sx={{ m: 0 }}
                />
            </Card>
        );
    };

    const renderRadioGroup = (field,formData ,onFieldChange) => {
        const options = field.options || ['Option 1', 'Option 2', 'Option 3'];
        
        return (
            <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFieldIcon(field.type)}
                        {formatFieldName(field.name)}
                    </Typography>
                    <RadioGroup
                        value={formData[field.name] || ''}
                        onChange={(e) => onFieldChange(field.name, e.target.value)}
                    >
                        {options.map((option) => (
                            <FormControlLabel
                                key={option}
                                value={option}
                                control={<Radio size="small" />}
                                label={<Typography variant="body2">{option}</Typography>}
                            />
                        ))}
                    </RadioGroup>
                </Stack>
            </Card>
        );
    };

    const renderDropdown = (field,formData ,onFieldChange) => {
        const options = field.options || ['Select Option 1', 'Select Option 2', 'Select Option 3'];
        
        return (
            <FormControl fullWidth variant="outlined">
                <InputLabel>{formatFieldName(field.name)}</InputLabel>
                <Select
                    value={formData[field.name] || ''}
                    onChange={(e) => onFieldChange(field.name, e.target.value)}
                    label={formatFieldName(field.name)}
                    sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                        },
                    }}
                    startAdornment={
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                            {getFieldIcon(field.type)}
                        </Box>
                    }
                >
                    {options.map((option) => (
                        <MenuItem key={option} value={option}>
                            <Typography variant="body2">{option}</Typography>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    };

    const renderOptionList = (field,formData ,onFieldChange) => {
        const options = field.options || ['List Item 1', 'List Item 2', 'List Item 3', 'List Item 4'];
        
        return (
            <FormControl fullWidth variant="outlined">
                <InputLabel>{formatFieldName(field.name)}</InputLabel>
                <Select
                    multiple
                    value={formData[field.name] || []}
                    onChange={(e) => onFieldChange(field.name, e.target.value)}
                    input={<OutlinedInput label={formatFieldName(field.name)} />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip 
                                    key={value} 
                                    label={value} 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    )}
                    sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                        },
                    }}
                    startAdornment={
                        <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                            {getFieldIcon(field.type)}
                        </Box>
                    }
                >
                    {options.map((option) => (
                        <MenuItem key={option} value={option}>
                            <Checkbox 
                                checked={(formData[field.name] || []).indexOf(option) > -1} 
                                size="small"
                            />
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    };


    export {
        getFieldIcon,
        renderTextField,
        renderCheckBox,
        renderRadioGroup,
        renderDropdown,
        renderOptionList,
        isImageField,
        formatFieldName,
    }