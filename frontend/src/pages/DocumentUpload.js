import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, List, ListItem, ListItemText, Alert, Box, Chip } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [documents, setDocuments] = useState([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents/');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Files uploaded successfully!');
      setFiles([]);
      fetchDocuments(); // Refresh the document list
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'success';
      case 'processing': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container className="container">
      <Typography variant="h4" gutterBottom>
        Upload Tax Documents
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload your tax documents for automatic processing and data extraction.
      </Typography>

      {message && (
        <Alert severity={message.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
        sx={{ mb: 3 }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        {isDragActive ? (
          <Typography variant="h6">Drop the files here...</Typography>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Drag & drop tax documents here, or click to select files
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, Images (PNG, JPG), Excel, CSV
            </Typography>
          </Box>
        )}
      </Paper>

      {files.length > 0 && (
        <Paper sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Selected Files:
          </Typography>
          <List>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={file.name}
                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                />
                <Button onClick={() => removeFile(index)} color="error">
                  Remove
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Button
        variant="contained"
        onClick={uploadFiles}
        disabled={files.length === 0 || uploading}
        size="large"
        sx={{ mb: 4 }}
      >
        {uploading ? 'Uploading...' : 'Upload Files'}
      </Button>

      {documents.length > 0 && (
        <Paper sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Your Documents:
          </Typography>
          <List>
            {documents.map((doc) => (
              <ListItem key={doc.id}>
                <ListItemText
                  primary={doc.filename}
                  secondary={`Type: ${doc.document_type} • Uploaded: ${new Date(doc.created_at).toLocaleDateString()}`}
                />
                <Chip 
                  label={doc.status} 
                  color={getStatusColor(doc.status)}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default DocumentUpload;