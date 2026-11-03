import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Lightbulb, 
  Droplets, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  ChevronDown, 
  SlidersHorizontal, 
  Filter, 
  ArrowUpDown, 
  Sparkles, 
  X, 
  Users, 
  Building2, 
  MoreHorizontal, 
  Check, 
  Download, 
  ExternalLink, 
  Share2, 
  ShieldCheck, 
  Search,
  Eye,
  AlertCircle
} from 'lucide-react';
import client from '../api/client';
import { subscribeToDetections } from '../api/socket';
import DetectionModal from '../components/DetectionModal';
import { generateReportPDF } from '../utils/pdfGenerator';

// High-fidelity seed reports matching the exact screenshot & counters
const SEED_INCOMING_REPORTS = [
  {
    id: 'UE-78421',
    displayId: '#UE-78421',
    categoryKey: 'pothole',
    categoryTitle: 'Pothole',
    location: 'Sector 62, Main Road',
    address: 'Sector 62, Main Road, Noida',
    imageUrl: '/test_real_pothole.jpg',
    images: [
      '/test_real_pothole.jpg',
      'https://images.unsplash.com/photo-1515260268569-9271009adfdb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80'
    ],
    reportedTime: '10 min ago',
    date: 'Today, 10:14 AM',
    priority: 'High',
    severity: 'high',
    status: 'new',
    confidence: '0.92',
    model: 'YOLOv8',
    aiTags: ['Pothole', 'Road Damage'],
    department: 'Public Works Department',
    coordinates: { lat: 28.6280, lng: 77.3649 }
  },
  {
    id: 'UE-78420',
    displayId: '#UE-78420',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage',
    location: 'Sector 51, Park Lane',
    address: 'Sector 51, Park Lane, Noida',
    imageUrl: '/test_real_garbage.jpg',
    images: [
      '/test_real_garbage.jpg',
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80'
    ],
    reportedTime: '22 min ago',
    date: 'Today, 10:02 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'new',
    confidence: '0.95',
    model: 'YOLOv8',
    aiTags: ['Garbage', 'Overflow'],
    department: 'Sanitation Dept',
    coordinates: { lat: 28.5850, lng: 77.3680 }
  },
  {
    id: 'UE-78419',
    displayId: '#UE-78419',
    categoryKey: 'streetlight',
    categoryTitle: 'Streetlight',
    location: 'Sector 93, Block A',
    address: 'Sector 93, Block A, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80'
    ],
    reportedTime: '35 min ago',
    date: 'Today, 09:49 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'in_review',
    confidence: '0.88',
    model: 'YOLOv8',
    aiTags: ['Streetlight', 'Faulty Fixture'],
    department: 'Electrical Maintenance',
    coordinates: { lat: 28.5200, lng: 77.3800 }
  },
  {
    id: 'UE-78418',
    displayId: '#UE-78418',
    categoryKey: 'water',
    categoryTitle: 'Water Leak',
    location: 'Sector 75, Metro Road',
    address: 'Sector 75, Metro Road, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80'
    ],
    reportedTime: '50 min ago',
    date: 'Today, 09:34 AM',
    priority: 'Low',
    severity: 'low',
    status: 'new',
    confidence: '0.91',
    model: 'YOLOv8',
    aiTags: ['Water Leak', 'Pipe Seepage'],
    department: 'Jal Board',
    coordinates: { lat: 28.5720, lng: 77.3750 }
  },
  {
    id: 'UE-78417',
    displayId: '#UE-78417',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage',
    location: 'Sector 44, Community Park',
    address: 'Sector 44, Community Park, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80'
    ],
    reportedTime: '1 hr ago',
    date: 'Today, 09:15 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'in_review',
    confidence: '0.89',
    model: 'YOLOv8',
    aiTags: ['Garbage', 'Public Bins'],
    department: 'Sanitation Dept',
    coordinates: { lat: 28.5550, lng: 77.3390 }
  },
  // Additional reports to total 24 (8 High, 11 Medium, 5 Low)
  {
    id: 'UE-78416',
    displayId: '#UE-78416',
    categoryKey: 'pothole',
    categoryTitle: 'Pothole',
    location: 'Expressway Flyover Ramp',
    address: 'Noida-Greater Noida Expressway, KM 14',
    imageUrl: '/test_real_pothole.jpg',
    images: ['/test_real_pothole.jpg'],
    reportedTime: '1 hr 15m ago',
    date: 'Today, 09:00 AM',
    priority: 'High',
    severity: 'high',
    status: 'new',
    confidence: '0.96',
    model: 'YOLOv8',
    aiTags: ['Pothole', 'Highway Hazard'],
    department: 'Public Works Department',
    coordinates: { lat: 28.5080, lng: 77.4020 }
  },
  {
    id: 'UE-78415',
    displayId: '#UE-78415',
    categoryKey: 'water',
    categoryTitle: 'Water Leak',
    location: 'Sector 63, Block H',
    address: 'Sector 63, Industrial Area, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80'],
    reportedTime: '1 hr 30m ago',
    date: 'Today, 08:45 AM',
    priority: 'High',
    severity: 'high',
    status: 'new',
    confidence: '0.94',
    model: 'YOLOv8',
    aiTags: ['Water Main', 'High Pressure'],
    department: 'Jal Board',
    coordinates: { lat: 28.6255, lng: 77.3820 }
  },
  {
    id: 'UE-78414',
    displayId: '#UE-78414',
    categoryKey: 'pothole',
    categoryTitle: 'Pothole',
    location: 'Sector 18, Metro Pillar 42',
    address: 'Atta Market, Sector 18, Noida',
    imageUrl: '/test_real_pothole.jpg',
    images: ['/test_real_pothole.jpg'],
    reportedTime: '1 hr 45m ago',
    date: 'Today, 08:30 AM',
    priority: 'High',
    severity: 'high',
    status: 'in_review',
    confidence: '0.93',
    model: 'YOLOv8',
    aiTags: ['Pothole', 'Deep Crater'],
    department: 'Public Works Department',
    coordinates: { lat: 28.5708, lng: 77.3260 }
  },
  {
    id: 'UE-78413',
    displayId: '#UE-78413',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage',
    location: 'Sector 12, Primary School Gate',
    address: 'Sector 12, Noida',
    imageUrl: '/test_real_garbage.jpg',
    images: ['/test_real_garbage.jpg'],
    reportedTime: '2 hrs ago',
    date: 'Today, 08:15 AM',
    priority: 'High',
    severity: 'high',
    status: 'new',
    confidence: '0.91',
    model: 'YOLOv8',
    aiTags: ['Garbage', 'School Zone'],
    department: 'Sanitation Dept',
    coordinates: { lat: 28.5990, lng: 77.3350 }
  },
  {
    id: 'UE-78412',
    displayId: '#UE-78412',
    categoryKey: 'streetlight',
    categoryTitle: 'Streetlight',
    location: 'Sector 76, Main Crossroad',
    address: 'Sector 76, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80'],
    reportedTime: '2 hrs 10m ago',
    date: 'Today, 08:05 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'new',
    confidence: '0.87',
    model: 'YOLOv8',
    aiTags: ['Streetlight', 'Pole Dark'],
    department: 'Electrical Maintenance',
    coordinates: { lat: 28.5680, lng: 77.3780 }
  },
  {
    id: 'UE-78411',
    displayId: '#UE-78411',
    categoryKey: 'pothole',
    categoryTitle: 'Pothole',
    location: 'Sector 22, B-Block Market',
    address: 'Sector 22, Noida',
    imageUrl: '/test_real_pothole.jpg',
    images: ['/test_real_pothole.jpg'],
    reportedTime: '2 hrs 30m ago',
    date: 'Today, 07:45 AM',
    priority: 'High',
    severity: 'high',
    status: 'new',
    confidence: '0.95',
    model: 'YOLOv8',
    aiTags: ['Pothole', 'Edge Collapse'],
    department: 'Public Works Department',
    coordinates: { lat: 28.5920, lng: 77.3450 }
  },
  {
    id: 'UE-78410',
    displayId: '#UE-78410',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage',
    location: 'Sector 15, Metro Exit 2',
    address: 'Sector 15, Noida',
    imageUrl: '/test_real_garbage.jpg',
    images: ['/test_real_garbage.jpg'],
    reportedTime: '2 hrs 45m ago',
    date: 'Today, 07:30 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'new',
    confidence: '0.90',
    model: 'YOLOv8',
    aiTags: ['Garbage', 'Transit Hub'],
    department: 'Sanitation Dept',
    coordinates: { lat: 28.5830, lng: 77.3140 }
  },
  {
    id: 'UE-78409',
    displayId: '#UE-78409',
    categoryKey: 'streetlight',
    categoryTitle: 'Streetlight',
    location: 'Sector 104, Pathway 3',
    address: 'Sector 104, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80'],
    reportedTime: '3 hrs ago',
    date: 'Today, 07:15 AM',
    priority: 'Low',
    severity: 'low',
    status: 'new',
    confidence: '0.86',
    model: 'YOLOv8',
    aiTags: ['Streetlight', 'Dimming'],
    department: 'Electrical Maintenance',
    coordinates: { lat: 28.5350, lng: 77.3680 }
  },
  {
    id: 'UE-78408',
    displayId: '#UE-78408',
    categoryKey: 'water',
    categoryTitle: 'Water Leak',
    location: 'Sector 29, Church Road',
    address: 'Sector 29, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80'],
    reportedTime: '3 hrs 15m ago',
    date: 'Today, 07:00 AM',
    priority: 'High',
    severity: 'high',
    status: 'new',
    confidence: '0.93',
    model: 'YOLOv8',
    aiTags: ['Water Leak', 'Road Flooding'],
    department: 'Jal Board',
    coordinates: { lat: 28.5700, lng: 77.3380 }
  },
  {
    id: 'UE-78407',
    displayId: '#UE-78407',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage',
    location: 'Sector 82, Pocket 7',
    address: 'Sector 82, Noida',
    imageUrl: '/test_real_garbage.jpg',
    images: ['/test_real_garbage.jpg'],
    reportedTime: '3 hrs 40m ago',
    date: 'Today, 06:35 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'in_review',
    confidence: '0.88',
    model: 'YOLOv8',
    aiTags: ['Garbage', 'Green Waste'],
    department: 'Sanitation Dept',
    coordinates: { lat: 28.5310, lng: 77.3990 }
  },
  {
    id: 'UE-78406',
    displayId: '#UE-78406',
    categoryKey: 'pothole',
    categoryTitle: 'Pothole',
    location: 'Sector 50, Central Avenue',
    address: 'Sector 50, Noida',
    imageUrl: '/test_real_pothole.jpg',
    images: ['/test_real_pothole.jpg'],
    reportedTime: '4 hrs ago',
    date: 'Today, 06:15 AM',
    priority: 'High',
    severity: 'high',
    status: 'new',
    confidence: '0.92',
    model: 'YOLOv8',
    aiTags: ['Pothole', 'Deep Trench'],
    department: 'Public Works Department',
    coordinates: { lat: 28.5780, lng: 77.3610 }
  },
  {
    id: 'UE-78405',
    displayId: '#UE-78405',
    categoryKey: 'streetlight',
    categoryTitle: 'Streetlight',
    location: 'Sector 41, Gate 4',
    address: 'Sector 41, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80'],
    reportedTime: '4 hrs 20m ago',
    date: 'Today, 05:55 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'in_review',
    confidence: '0.85',
    model: 'YOLOv8',
    aiTags: ['Streetlight', 'Wiring Issue'],
    department: 'Electrical Maintenance',
    coordinates: { lat: 28.5610, lng: 77.3520 }
  },
  {
    id: 'UE-78404',
    displayId: '#UE-78404',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage',
    location: 'Sector 34, Market Square',
    address: 'Sector 34, Noida',
    imageUrl: '/test_real_garbage.jpg',
    images: ['/test_real_garbage.jpg'],
    reportedTime: '4 hrs 45m ago',
    date: 'Today, 05:30 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'new',
    confidence: '0.91',
    model: 'YOLOv8',
    aiTags: ['Garbage', 'Commercial Dump'],
    department: 'Sanitation Dept',
    coordinates: { lat: 28.5860, lng: 77.3540 }
  },
  {
    id: 'UE-78403',
    displayId: '#UE-78403',
    categoryKey: 'water',
    categoryTitle: 'Water Leak',
    location: 'Sector 19, Park Perimeter',
    address: 'Sector 19, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80'],
    reportedTime: '5 hrs ago',
    date: 'Today, 05:15 AM',
    priority: 'Low',
    severity: 'low',
    status: 'new',
    confidence: '0.89',
    model: 'YOLOv8',
    aiTags: ['Water Leak', 'Sprinkler Valve'],
    department: 'Jal Board',
    coordinates: { lat: 28.5770, lng: 77.3230 }
  },
  {
    id: 'UE-78402',
    displayId: '#UE-78402',
    categoryKey: 'pothole',
    categoryTitle: 'Pothole',
    location: 'Sector 122, Service Lane',
    address: 'Sector 122, Noida',
    imageUrl: '/test_real_pothole.jpg',
    images: ['/test_real_pothole.jpg'],
    reportedTime: '5 hrs 20m ago',
    date: 'Today, 04:55 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'new',
    confidence: '0.90',
    model: 'YOLOv8',
    aiTags: ['Pothole', 'Surface Crack'],
    department: 'Public Works Department',
    coordinates: { lat: 28.6010, lng: 77.3910 }
  },
  {
    id: 'UE-78401',
    displayId: '#UE-78401',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage',
    location: 'Sector 71, Junction Roundabout',
    address: 'Sector 71, Noida',
    imageUrl: '/test_real_garbage.jpg',
    images: ['/test_real_garbage.jpg'],
    reportedTime: '5 hrs 45m ago',
    date: 'Today, 04:30 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'new',
    confidence: '0.89',
    model: 'YOLOv8',
    aiTags: ['Garbage', 'Roadside Litter'],
    department: 'Sanitation Dept',
    coordinates: { lat: 28.5910, lng: 77.3710 }
  },
  {
    id: 'UE-78400',
    displayId: '#UE-78400',
    categoryKey: 'streetlight',
    categoryTitle: 'Streetlight',
    location: 'Sector 128, Green Belt Road',
    address: 'Sector 128, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80'],
    reportedTime: '6 hrs ago',
    date: 'Today, 04:15 AM',
    priority: 'Low',
    severity: 'low',
    status: 'new',
    confidence: '0.84',
    model: 'YOLOv8',
    aiTags: ['Streetlight', 'Cover Open'],
    department: 'Electrical Maintenance',
    coordinates: { lat: 28.5150, lng: 77.3620 }
  },
  {
    id: 'UE-78399',
    displayId: '#UE-78399',
    categoryKey: 'water',
    categoryTitle: 'Water Leak',
    location: 'Sector 93B, Grand Omaxe Lane',
    address: 'Sector 93B, Noida',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1541888946425-d0fbb18615f3?w=800&auto=format&fit=crop&q=80'],
    reportedTime: '6 hrs 30m ago',
    date: 'Today, 03:45 AM',
    priority: 'Low',
    severity: 'low',
    status: 'new',
    confidence: '0.88',
    model: 'YOLOv8',
    aiTags: ['Water Leak', 'Drainage Spurt'],
    department: 'Jal Board',
    coordinates: { lat: 28.5120, lng: 77.3880 }
  },
  {
    id: 'UE-78398',
    displayId: '#UE-78398',
    categoryKey: 'garbage',
    categoryTitle: 'Garbage',
    location: 'Sector 110, Market Perimeter',
    address: 'Sector 110, Noida',
    imageUrl: '/test_real_garbage.jpg',
    images: ['/test_real_garbage.jpg'],
    reportedTime: '7 hrs ago',
    date: 'Today, 03:15 AM',
    priority: 'Medium',
    severity: 'medium',
    status: 'in_review',
    confidence: '0.90',
    model: 'YOLOv8',
    aiTags: ['Garbage', 'Uncleared Bin'],
    department: 'Sanitation Dept',
    coordinates: { lat: 28.5250, lng: 77.3820 }
  }
];

export default function AdminIncomingReportsPage() {
  const [reports, setReports] = useState(SEED_INCOMING_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState('UE-78421');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'new', 'in_review', 'verified'
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter & Sort menus
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'oldest', 'priority'
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Department Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Full Details Modal
  const [modalDetection, setModalDetection] = useState(null);

  // More options dropdown
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real data from backend and merge seamlessly
  const fetchBackendReports = async () => {
    try {
      setLoading(true);
      const res = await client.get('/api/detections').catch(() => ({ data: { detections: [] } }));
      const backendDetections = res.data?.detections || [];
      if (backendDetections.length > 0) {
        // Map backend detections to match interface
        const mappedBackend = backendDetections.map((d, idx) => {
          const typeStr = String(d.type || d.className || 'pothole').toLowerCase();
          let catKey = 'pothole';
          let catTitle = 'Pothole';
          if (typeStr.includes('garbage') || typeStr.includes('waste')) {
            catKey = 'garbage'; catTitle = 'Garbage';
          } else if (typeStr.includes('light') || typeStr.includes('lamp') || typeStr.includes('street')) {
            catKey = 'streetlight'; catTitle = 'Streetlight';
          } else if (typeStr.includes('water') || typeStr.includes('leak')) {
            catKey = 'water'; catTitle = 'Water Leak';
          }

          const sev = String(d.severity || d.priority || 'medium').toLowerCase();
          const priority = sev.charAt(0).toUpperCase() + sev.slice(1);
          const rawId = d.id || d._id || `UE-${80000 + idx}`;
          const displayId = rawId.startsWith('#') ? rawId : (rawId.startsWith('UE-') ? `#${rawId}` : `#UE-${String(rawId).slice(-5).toUpperCase()}`);
          
          let img = d.imageUrl;
          if (!img) {
            img = catKey === 'garbage' ? '/test_real_garbage.jpg' : '/test_real_pothole.jpg';
          }

          const tags = [catTitle];
          if (catKey === 'pothole') tags.push('Road Damage');
          else if (catKey === 'garbage') tags.push('Refuse');
          else if (catKey === 'water') tags.push('Pipeline');
          else tags.push('Infrastructure');

          return {
            id: rawId,
            displayId,
            categoryKey: catKey,
            categoryTitle: catTitle,
            location: d.address || 'Sector 62, Main Road',
            address: d.address || 'Sector 62, Main Road, Noida',
            imageUrl: img,
            images: [img],
            reportedTime: 'Just now',
            date: new Date(d.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            priority: priority,
            severity: sev,
            status: d.status || 'new',
            confidence: d.confidence ? Number(d.confidence).toFixed(2) : '0.92',
            model: 'YOLOv8',
            aiTags: tags,
            department: d.assignedDepartment || (catKey === 'garbage' ? 'Sanitation Dept' : 'Public Works Department'),
            coordinates: { lat: d.lat || 28.6280, lng: d.lng || 77.3649 },
            rawDoc: d
          };
        });

        // Combine backend reports with seed reports
        const merged = [...mappedBackend];
        SEED_INCOMING_REPORTS.forEach(seed => {
          if (!merged.some(m => m.id === seed.id || m.displayId === seed.displayId)) {
            merged.push(seed);
          }
        });
        setReports(merged);
      }
    } catch (err) {
      console.warn('Using seed reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendReports();

    const unsub = subscribeToDetections({
      onCreated: () => fetchBackendReports(),
      onUpdated: () => fetchBackendReports(),
      onMerged: () => fetchBackendReports()
    });

    return () => unsub();
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // Tab filter
      if (activeTab === 'new' && r.status !== 'new') return false;
      if (activeTab === 'in_review' && r.status !== 'in_review') return false;
      if (activeTab === 'verified' && r.status !== 'verified') return false;

      // Category filter
      if (categoryFilter !== 'all' && r.categoryKey !== categoryFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && r.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[b.severity] || 2) - (order[a.severity] || 2);
      }
      return 0; // default latest order
    });
  }, [reports, activeTab, categoryFilter, priorityFilter, sortBy]);

  // Selected report
  const selectedReport = useMemo(() => {
    return reports.find(r => r.id === selectedReportId) || filteredReports[0] || reports[0];
  }, [reports, selectedReportId, filteredReports]);

  // Reset carousel image index when selected report changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedReport?.id]);

  // Pagination logic
  const totalReportsCount = filteredReports.length;
  const totalPages = Math.ceil(totalReportsCount / itemsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalReportsCount);

  // Tab counters
  const counts = useMemo(() => {
    const all = reports.length;
    const newCount = reports.filter(r => r.status === 'new').length;
    const inReviewCount = reports.filter(r => r.status === 'in_review').length;
    const verifiedCount = reports.filter(r => r.status === 'verified').length;

    const high = reports.filter(r => r.priority === 'High' || r.severity === 'high').length;
    const medium = reports.filter(r => r.priority === 'Medium' || r.severity === 'medium').length;
    const low = reports.filter(r => r.priority === 'Low' || r.severity === 'low').length;

    return { all, newCount, inReviewCount, verifiedCount, high, medium, low };
  }, [reports]);

  // Verify report action
  const handleVerifyReport = async () => {
    if (!selectedReport) return;
    try {
      // Optimistic update
      setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status: 'verified' } : r));
      showToast(`Report ${selectedReport.displayId} verified successfully!`);

      // Backend sync if real MongoDB document exists
      if (selectedReport.rawDoc?.id || selectedReport.rawDoc?._id) {
        await client.patch(`/api/detections/${selectedReport.rawDoc.id || selectedReport.rawDoc._id}/status`, {
          status: 'verified'
        }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Department assignment
  const handleAssignDepartment = async (deptName) => {
    if (!selectedReport) return;
    try {
      setAssigning(true);
      setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, department: deptName, status: 'in_review' } : r));
      setShowAssignModal(false);
      showToast(`Assigned to ${deptName}`);

      if (selectedReport.rawDoc?.id || selectedReport.rawDoc?._id) {
        await client.patch(`/api/detections/${selectedReport.rawDoc.id || selectedReport.rawDoc._id}`, {
          assignedDepartment: deptName,
          status: 'assigned'
        }).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  // Category Icon helper
  const renderCategoryIcon = (key) => {
    switch (key) {
      case 'pothole':
        return <AlertTriangle className="w-3.5 h-3.5 text-slate-700" />;
      case 'garbage':
        return <Trash2 className="w-3.5 h-3.5 text-slate-700" />;
      case 'streetlight':
        return <Lightbulb className="w-3.5 h-3.5 text-slate-700" />;
      case 'water':
        return <Droplets className="w-3.5 h-3.5 text-slate-700" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  // Priority Pill helper
  const renderPriorityBadge = (priority) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'high' || p === 'critical') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
          High
        </span>
      );
    }
    if (p === 'low') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
          Low
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
        Medium
      </span>
    );
  };

  const imagesList = selectedReport?.images?.length ? selectedReport.images : [selectedReport?.imageUrl || '/test_real_pothole.jpg'];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-7 max-w-[1550px] mx-auto space-y-5 animate-fade-in font-sans text-slate-800">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#06252B] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl border border-teal-500/40 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. HEADER SECTION (Exact Screenshot Icon & Typography)              */}
      {/* =================================================================== */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#E6F5EE] border border-[#CDEEDF] flex items-center justify-center shrink-0 shadow-2xs">
          <FileText className="w-5 h-5 text-[#00897B]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2027] tracking-tight leading-tight">
            Incoming Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review and verify citizen submitted issues.
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. TELEMETRY & TREND KPI CARD (Exact Screenshot Component)          */}
      {/* =================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Left: New Reports Total & Severity Breakdown */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#E6F5EE] border border-[#CDEEDF] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-[#00897B]" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-[#0B2027] leading-none">
                {counts.newCount || 24}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">
                New Reports
              </div>
            </div>
          </div>

          {/* Breakdown dots */}
          <div className="flex items-center gap-5 text-xs sm:text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
              <span className="font-bold text-slate-900">{counts.high || 8}</span>
              <span className="text-slate-500">High</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span>
              <span className="font-bold text-slate-900">{counts.medium || 11}</span>
              <span className="text-slate-500">Medium</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span className="font-bold text-slate-900">{counts.low || 5}</span>
              <span className="text-slate-500">Low</span>
            </div>
          </div>
        </div>

        {/* Right: Today's Trend & Sparkline */}
        <div className="flex items-center justify-between md:justify-end gap-5 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700">Today's Trend</span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8F8F2] text-[#059669] flex items-center gap-0.5">
                <span>↑</span> 8%
              </span>
            </div>
          </div>

          {/* Smooth Green Sparkline (Exact Screenshot Line Chart) */}
          <div className="w-32 h-10 flex items-center">
            <svg viewBox="0 0 100 32" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,22 Q 15,24 28,18 T 55,20 T 78,10 T 100,5 L 100,32 L 0,32 Z"
                fill="url(#trendGradient)"
              />
              <path
                d="M 0,22 Q 15,24 28,18 T 55,20 T 78,10 T 100,5"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="100" cy="5" r="3" fill="#10B981" className="animate-ping" opacity="0.75" />
              <circle cx="100" cy="5" r="2.5" fill="#10B981" />
            </svg>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN WORKSPACE: TWO-COLUMN REPORT VIEWER                         */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ================================================================= */}
        {/* 3A. LEFT COLUMN: REPORT FEED & TABS (lg:col-span-7)               */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col justify-between space-y-4">
          
          {/* Top Filter Tabs & Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              <button
                type="button"
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-[#005C53] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>All Reports</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {counts.all || 24}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('new'); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'new'
                    ? 'bg-[#005C53] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>New</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 text-slate-700">
                  {counts.newCount || 24}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('in_review'); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'in_review'
                    ? 'bg-[#005C53] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>In Review</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 text-slate-700">
                  {counts.inReviewCount || 6}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('verified'); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'verified'
                    ? 'bg-[#005C53] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Verified</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-200 text-slate-700">
                  {counts.verifiedCount || 0}
                </span>
              </button>
            </div>

            {/* Filter & Sort Dropdowns */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 relative">
              {/* Filter Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    categoryFilter !== 'all' || priorityFilter !== 'all'
                      ? 'border-[#00897B] text-[#00897B] bg-teal-50'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-30 space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</label>
                      <select 
                        value={categoryFilter} 
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="mt-1 w-full text-xs rounded-lg border border-slate-200 p-1.5 focus:outline-none focus:border-teal-500"
                      >
                        <option value="all">All Categories</option>
                        <option value="pothole">Pothole</option>
                        <option value="garbage">Garbage</option>
                        <option value="streetlight">Streetlight</option>
                        <option value="water">Water Leak</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</label>
                      <select 
                        value={priorityFilter} 
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="mt-1 w-full text-xs rounded-lg border border-slate-200 p-1.5 focus:outline-none focus:border-teal-500"
                      >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => { setCategoryFilter('all'); setPriorityFilter('all'); }}
                        className="text-[11px] text-slate-500 hover:text-slate-700"
                      >
                        Reset
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowFilterDropdown(false)}
                        className="px-2.5 py-1 bg-[#005C53] text-white rounded-md text-[11px] font-bold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Latest Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span className="capitalize">{sortBy}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30">
                    <button
                      type="button"
                      onClick={() => { setSortBy('latest'); setShowSortDropdown(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Latest First
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSortBy('priority'); setShowSortDropdown(false); }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Highest Priority
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* List of Report Cards (5 shown per page) */}
          <div className="space-y-2.5">
            {paginatedReports.map((report) => {
              const isSelected = selectedReport?.id === report.id;

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`
                    p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group
                    ${isSelected 
                      ? 'border-[#00897B]/50 bg-[#F0FAF7] shadow-xs' 
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }
                  `}
                >
                  {/* Left: Thumbnail & Main info */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <img 
                      src={report.imageUrl} 
                      alt={report.categoryTitle}
                      className="w-14 h-14 sm:w-16 sm:h-14 rounded-xl object-cover shrink-0 border border-slate-100 bg-slate-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/test_real_pothole.jpg';
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-sm text-[#0B2027] truncate">
                        {report.displayId}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 truncate font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{report.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Category Pill */}
                  <div className="hidden sm:flex items-center">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      {renderCategoryIcon(report.categoryKey)}
                      <span>{report.categoryTitle}</span>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <div className="shrink-0">
                    {renderPriorityBadge(report.priority)}
                  </div>

                  {/* Time ago */}
                  <div className="hidden md:block text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap min-w-[70px] text-right">
                    {report.reportedTime}
                  </div>

                  {/* Right chevron */}
                  <div className="text-slate-400 group-hover:text-slate-700 shrink-0 pl-1">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}

            {paginatedReports.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No reports found matching the selected filters.
              </div>
            )}
          </div>

          {/* Pagination Footer (Exact Screenshot Layout) */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <div>
              Showing {totalReportsCount > 0 ? startIndex : 0}–{endIndex} of {totalReportsCount} reports
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#005C53] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3B. RIGHT COLUMN: REPORT DETAIL CARD (lg:col-span-5)              */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 flex flex-col space-y-4">
          {selectedReport ? (
            <>
              {/* Header: ID, Priority, Close */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-[#0B2027] tracking-tight">
                    {selectedReport.displayId}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-500" />
                    <span>{selectedReport.priority} Priority</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {}}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Close inspection"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Photo Carousel (Exact Screenshot View) */}
              <div className="space-y-2">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 aspect-video group">
                  <img
                    src={imagesList[currentImageIndex] || selectedReport.imageUrl}
                    alt={selectedReport.categoryTitle}
                    className="w-full h-full object-cover transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/test_real_pothole.jpg';
                    }}
                  />

                  {/* Navigation Arrows */}
                  {imagesList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 shadow-md hover:bg-white transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={nextImage}
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 shadow-md hover:bg-white transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* Carousel Indicator Dots */}
                {imagesList.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    {imagesList.map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        onClick={() => setCurrentImageIndex(dotIdx)}
                        className={`cursor-pointer rounded-full transition-all ${
                          currentImageIndex === dotIdx
                            ? 'w-2 h-2 bg-[#00897B]'
                            : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Location, Time, Status & Mini Map Thumbnail (Exact Screenshot Row) */}
              <div className="flex items-center justify-between gap-3 pt-1">
                {/* Meta details on left */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{selectedReport.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Reported {selectedReport.reportedTime} by Citizen</span>
                  </div>

                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 flex items-center justify-center text-[9px] text-slate-500">
                      i
                    </span>
                    <span className="text-slate-600">Status:</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EBF5FF] text-[#2563EB] border border-blue-200/60 capitalize">
                      {selectedReport.status === 'in_review' ? 'In Review' : (selectedReport.status || 'New')}
                    </span>
                  </div>
                </div>

                {/* Mini Map Thumbnail with Red Pin Marker */}
                <div 
                  className="w-28 sm:w-32 h-20 rounded-xl overflow-hidden border border-slate-200 relative bg-[#EBF5F3] shrink-0 shadow-2xs group cursor-pointer"
                  onClick={() => window.open(`https://www.google.com/maps?q=${selectedReport.coordinates.lat},${selectedReport.coordinates.lng}`, '_blank')}
                  title="Open in Google Maps"
                >
                  {/* Styled vector map background */}
                  <svg viewBox="0 0 120 75" className="w-full h-full">
                    {/* Land & Park background */}
                    <rect width="120" height="75" fill="#E8F4F0" />
                    <rect x="10" y="8" width="40" height="25" fill="#DCF0E8" rx="4" />
                    <rect x="75" y="42" width="38" height="26" fill="#DCF0E8" rx="4" />
                    {/* Canal/river */}
                    <path d="M-10,65 Q 40,40 130,20" stroke="#BFDBFE" strokeWidth="6" fill="none" />
                    {/* Roads */}
                    <path d="M 0,35 L 120,35" stroke="#FFFFFF" strokeWidth="5" />
                    <path d="M 60,0 L 60,75" stroke="#FFFFFF" strokeWidth="5" />
                    <path d="M 20,0 L 20,75" stroke="#FFFFFF" strokeWidth="2.5" />
                    <path d="M 95,0 L 95,75" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>

                  {/* Red Drop Pin Marker with Pulse */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border border-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </span>
                    <span className="w-2 h-1 bg-black/20 rounded-full blur-2xs mt-0.5"></span>
                  </div>
                </div>
              </div>

              {/* AI Analysis (YOLOv8) Section */}
              <div className="bg-[#F8FBFA] rounded-2xl p-3.5 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B2027]">
                    <Sparkles className="w-3.5 h-3.5 text-[#00897B]" />
                    <span>AI Analysis (YOLOv8)</span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F5EE] text-[#00897B] border border-[#CDEEDF]">
                    Confidence: {selectedReport.confidence || '0.92'}
                  </span>
                </div>

                {/* AI Tags */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5 shadow-2xs">
                    {renderCategoryIcon(selectedReport.categoryKey)}
                    <span>{selectedReport.categoryTitle}</span>
                  </div>

                  {selectedReport.aiTags?.filter(t => t !== selectedReport.categoryTitle).map((tag, i) => (
                    <div key={i} className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full border border-slate-400"></span>
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons (Exact Screenshot Buttons) */}
              <div className="flex items-center gap-2.5 pt-2">
                {/* Verify Report (Primary Dark Green Button) */}
                <button
                  type="button"
                  onClick={handleVerifyReport}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#005C53] hover:bg-[#004A43] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                >
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Verify Report</span>
                </button>

                {/* Assign Department Button */}
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="py-2.5 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Assign Department</span>
                </button>

                {/* More Options Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center shadow-2xs transition-all"
                    title="More actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {showMoreMenu && (
                    <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setModalDetection(selectedReport.rawDoc || {
                            id: selectedReport.id,
                            type: selectedReport.categoryKey,
                            severity: selectedReport.severity,
                            status: selectedReport.status,
                            address: selectedReport.address,
                            imageUrl: selectedReport.imageUrl,
                            createdAt: new Date().toISOString()
                          });
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-600" />
                        <span>Comprehensive Triage</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          setShowMoreMenu(false);
                          await generateReportPDF(selectedReport);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Download PDF Report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          navigator.clipboard.writeText(window.location.origin + `/admin/issues?report=${selectedReport.id}`);
                          showToast('Report link copied to clipboard!');
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Share Report Link</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-400 text-xs">
              Select a report from the list to preview details.
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. MODALS (DEPARTMENT ASSIGNMENT & FULL TRIAGE)                     */}
      {/* =================================================================== */}
      {showAssignModal && selectedReport && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Assign Department ({selectedReport.displayId})
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAssignModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Select the responsible municipal authority to route this report for field remediation:
            </p>

            <div className="space-y-2">
              {[
                { name: 'Public Works Department (PWD)', key: 'roads', icon: AlertTriangle, desc: 'Potholes, road cavities, bridges & flyovers' },
                { name: 'Sanitation & Solid Waste Management', key: 'garbage', icon: Trash2, desc: 'Garbage heaps, commercial waste & dumpsters' },
                { name: 'Electrical & Street Lighting Dept', key: 'lighting', icon: Lightbulb, desc: 'Faulty poles, dark stretches & broken fixtures' },
                { name: 'Jal Board (Water & Sewage)', key: 'water', icon: Droplets, desc: 'Pipeline leaks, overflowing manholes & drain blocks' },
                { name: 'Traffic & Road Safety Authority', key: 'traffic', icon: ShieldCheck, desc: 'Signage, traffic hazards & signal faults' }
              ].map((dept) => {
                const Icon = dept.icon;
                return (
                  <button
                    key={dept.name}
                    type="button"
                    disabled={assigning}
                    onClick={() => handleAssignDepartment(dept.name)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 flex items-center gap-3 transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-teal-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-600 group-hover:text-teal-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">
                        {dept.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {dept.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Full Detection Modal */}
      {modalDetection && (
        <DetectionModal
          detection={modalDetection}
          onClose={() => setModalDetection(null)}
          onStatusUpdated={(updated) => {
            setReports(prev => prev.map(r => (r.id === updated.id || r.id === updated._id) ? { ...r, status: updated.status } : r));
            setModalDetection(null);
          }}
        />
      )}
    </div>
  );
}
