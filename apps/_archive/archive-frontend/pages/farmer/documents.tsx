import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import { PictureAsPdf, Image as ImageIcon, InsertDriveFile, Download } from '@mui/icons-material';
import Head from 'next/head';
import FarmerLayout from '../../components/layout/FarmerLayout';

export default function FarmerDocuments() {
  const documents = [
    { id: 1, name: 'สำเนาบัตรประชาชน.pdf', type: 'pdf', date: '2025-10-01', size: '2.5 MB' },
    { id: 2, name: 'แผนที่ฟาร์ม.jpg', type: 'image', date: '2025-09-28', size: '1.8 MB' },
    { id: 3, name: 'เอกสารกรรมสิทธิ์ที่ดิน.pdf', type: 'pdf', date: '2025-09-25', size: '3.2 MB' }
  ];

  const getFileIcon = (type: string) => {
    if (type === 'pdf') return <PictureAsPdf color="error" />;
    if (type === 'image') return <ImageIcon color="primary" />;
    return <InsertDriveFile />;
  };

  return (
    <>
      <Head>
        <title>เอกสาร - ระบบ GACP</title>
      </Head>
      <FarmerLayout>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
            เอกสาร
          </Typography>
          <Paper>
            <List>
              {documents.map(doc => (
                <ListItem
                  key={doc.id}
                  secondaryAction={
                    <Button size="small" startIcon={<Download />}>
                      ดาวน์โหลด
                    </Button>
                  }
                >
                  <ListItemIcon>{getFileIcon(doc.type)}</ListItemIcon>
                  <ListItemText
                    primary={doc.name}
                    secondary={`${new Date(doc.date).toLocaleDateString('th-TH')} • ${doc.size}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
      </FarmerLayout>
    </>
  );
}
