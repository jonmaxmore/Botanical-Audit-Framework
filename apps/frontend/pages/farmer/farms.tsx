import { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Agriculture,
  Add,
  Edit,
  Delete,
  LocationOn,
  Landscape,
  Verified
} from '@mui/icons-material';
import Head from 'next/head';
import FarmerLayout from '../../components/layout/FarmerLayout';

export default function FarmerFarms() {
  const [openDialog, setOpenDialog] = useState(false);

  const farms = [
    {
      id: 1,
      name: 'ฟาร์มสมุนไพรเชียงใหม่',
      location: 'เชียงใหม่',
      size: '15 ไร่',
      crops: 'กัญชา, ขมิ้นชัน',
      certified: true
    },
    {
      id: 2,
      name: 'ฟาร์มกัญชาทางการแพทย์',
      location: 'เชียงราย',
      size: '10 ไร่',
      crops: 'กัญชาทางการแพทย์',
      certified: false
    },
    {
      id: 3,
      name: 'ฟาร์มไพรสมุนไพรออร์แกนิก',
      location: 'ลำปาง',
      size: '20 ไร่',
      crops: 'ฟ้าทะลายโจร, ว่านหางจระเข้',
      certified: true
    }
  ];

  return (
    <>
      <Head>
        <title>ฟาร์มของฉัน - ระบบ GACP</title>
      </Head>

      <FarmerLayout>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              ฟาร์มของฉัน
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
              เพิ่มฟาร์มใหม่
            </Button>
          </Box>

          <Grid container spacing={3}>
            {farms.map(farm => (
              <Grid item xs={12} md={6} lg={4} key={farm.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Agriculture sx={{ fontSize: 40, color: 'primary.main' }} />
                      {farm.certified && (
                        <Chip label="รับรองแล้ว" color="success" size="small" icon={<Verified />} />
                      )}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {farm.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {farm.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Landscape fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        ขนาด: {farm.size}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      <strong>พืชที่ปลูก:</strong> {farm.crops}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button size="small" startIcon={<Edit />}>
                      แก้ไข
                    </Button>
                    <Button size="small" color="error" startIcon={<Delete />}>
                      ลบ
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </FarmerLayout>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>เพิ่มฟาร์มใหม่</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="ชื่อฟาร์ม" margin="normal" />
          <TextField fullWidth label="สถานที่" margin="normal" />
          <TextField fullWidth label="ขนาด (ไร่)" type="number" margin="normal" />
          <TextField fullWidth label="พืชที่ปลูก" margin="normal" multiline rows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
