import { useState, useEffect } from 'react';
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
  TextField,
  CircularProgress,
  Alert
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
import { api } from '../../src/lib/api';

interface Farm {
  id: string;
  _id?: string;
  name: string;
  location: string;
  province?: string;
  size: string | number;
  area?: number;
  crops: string;
  plantTypes?: string[];
  certified: boolean;
  certificationStatus?: string;
}

export default function FarmerFarms() {
  const [openDialog, setOpenDialog] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    crops: ''
  });

  // Fetch farms from API
  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/farm-management/farms');
      const farmsData = response.data.data || response.data.farms || response.data || [];
      setFarms(farmsData);
    } catch (err: any) {
      console.error('Error fetching farms:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลฟาร์มได้');
      // Fallback to empty array instead of mock data
      setFarms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async () => {
    try {
      setError('');
      await api.post('/api/farm-management/farms', {
        name: formData.name,
        location: formData.location,
        size: parseFloat(formData.size) || 0,
        crops: formData.crops,
        plantTypes: formData.crops.split(',').map(c => c.trim())
      });
      
      setOpenDialog(false);
      setFormData({ name: '', location: '', size: '', crops: '' });
      await fetchFarms(); // Refresh list
    } catch (err: any) {
      console.error('Error creating farm:', err);
      setError(err.response?.data?.message || 'ไม่สามารถสร้างฟาร์มได้');
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!confirm('คุณต้องการลบฟาร์มนี้หรือไม่?')) return;
    
    try {
      setError('');
      await api.delete(`/api/farm-management/farms/${farmId}`);
      await fetchFarms(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting farm:', err);
      setError(err.response?.data?.message || 'ไม่สามารถลบฟาร์มได้');
    }
  };

  const formatFarmData = (farm: Farm) => ({
    id: farm._id || farm.id,
    name: farm.name,
    location: farm.province || farm.location,
    size: typeof farm.size === 'number' ? `${farm.size} ไร่` : farm.size,
    crops: farm.plantTypes?.join(', ') || farm.crops,
    certified: farm.certified || farm.certificationStatus === 'approved'
  });

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

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : farms.length === 0 ? (
            <Alert severity="info">
              ยังไม่มีข้อมูลฟาร์ม กรุณาเพิ่มฟาร์มใหม่
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {farms.map(farm => {
                const displayFarm = formatFarmData(farm);
                return (
                  <Grid item xs={12} md={6} lg={4} key={displayFarm.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Agriculture sx={{ fontSize: 40, color: 'primary.main' }} />
                          {displayFarm.certified && (
                            <Chip label="รับรองแล้ว" color="success" size="small" icon={<Verified />} />
                          )}
                        </Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {displayFarm.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {displayFarm.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Landscape fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            ขนาด: {displayFarm.size}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          <strong>พืชที่ปลูก:</strong> {displayFarm.crops}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button size="small" startIcon={<Edit />}>
                          แก้ไข
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<Delete />}
                          onClick={() => handleDeleteFarm(displayFarm.id)}
                        >
                          ลบ
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      </FarmerLayout>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>เพิ่มฟาร์มใหม่</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            label="ชื่อฟาร์ม" 
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextField 
            fullWidth 
            label="สถานที่" 
            margin="normal"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
          <TextField 
            fullWidth 
            label="ขนาด (ไร่)" 
            type="number" 
            margin="normal"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
          />
          <TextField 
            fullWidth 
            label="พืชที่ปลูก (คั่นด้วยจุลภาค)" 
            margin="normal" 
            multiline 
            rows={2}
            value={formData.crops}
            onChange={(e) => setFormData({ ...formData, crops: e.target.value })}
            placeholder="เช่น กัญชา, ขมิ้นชัน, ฟ้าทะลายโจร"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>ยกเลิก</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateFarm}
            disabled={!formData.name || !formData.location || !formData.size || !formData.crops}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
