import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit, 
  Package, 
  DollarSign, 
  ShoppingBag, 
  AlertTriangle, 
  Save, 
  Check, 
  Phone, 
  Mail, 
  MapPin, 
  Lock, 
  Unlock, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  Key, 
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  Users,
  UserPlus,
  Shield,
  Crown,
  UserMinus,
  UserCheck,
  UserX,
  AlertCircle,
  Truck,
  Smartphone,
  Globe,
  History,
  Camera,
  Calendar,
  XCircle
} from 'lucide-react';
import { Product, Order, StoreSettings, StoreStats, User, TeamMember, TeamRole, TeamMemberStatus, OwnerAccount, OwnershipAuditEntry, GalleryPhoto } from '../types/index.ts';
import {
  fetchTeamMembers,
  onTeamMembersSnapshot,
  inviteTeamMember,
  updateTeamMemberRole,
  updateTeamMemberStatus,
  removeTeamMember,
  reauthenticateGoogleOwner
} from '../lib/firebase.ts';
import { AccessDenied } from './AccessDenied.tsx';
import { formatCurrencyPrice } from '../lib/currency.ts';

interface AdminDashboardProps {
  isOpen: boolean;
  currentUser: User | null;
  settings: StoreSettings;
  currency: string;
  exchangeRates?: Record<string, number>;
  onClose: () => void;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onProductChange: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  currentUser,
  settings,
  currency,
  exchangeRates,
  onClose,
  onUpdateSettings,
  onProductChange,
}) => {
  // Security Authentication Gate State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string>('');
  const [ownerEmailInput, setOwnerEmailInput] = useState('jawadsajid274@gmail.com');
  const [ownerPasscodeInput, setOwnerPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Tab & Data State
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'gallery' | 'team' | 'settings' | 'ownership'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Order Approval & Rejection Modal State
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected' | 'Shipped'>('all');
  const [selectedOrderForApproval, setSelectedOrderForApproval] = useState<Order | null>(null);
  const [approvalDeliveryDate, setApprovalDeliveryDate] = useState<string>('');
  const [approvalCourier, setApprovalCourier] = useState<string>('TCS White-Glove VIP Courier');
  const [approvalDeliveryNotes, setApprovalDeliveryNotes] = useState<string>('');
  const [approvalTrackingNumber, setApprovalTrackingNumber] = useState<string>('');
  const [approvingOrder, setApprovingOrder] = useState<boolean>(false);

  const [selectedOrderForRejection, setSelectedOrderForRejection] = useState<Order | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [rejectingOrder, setRejectingOrder] = useState<boolean>(false);

  // Gallery & Google Photos State (Owner-Only)
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Watches');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [googlePhotosAlbumUrl, setGooglePhotosAlbumUrl] = useState('');
  const [googlePhotosBatchUrls, setGooglePhotosBatchUrls] = useState('');
  const [gallerySource, setGallerySource] = useState<'upload' | 'google_photos'>('google_photos');
  const [galleryActionLoading, setGalleryActionLoading] = useState(false);
  const [galleryFeedback, setGalleryFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Team Management State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('ADMIN');
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamActionId, setTeamActionId] = useState<string | null>(null);
  const [teamFeedback, setTeamFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [teamSearchTerm, setTeamSearchTerm] = useState('');

  // Ownership Management State (Dual Super Owner Sovereignty)
  const [ownershipData, setOwnershipData] = useState<{
    currentOwnerType: 'owner1' | 'owner2';
    currentSessionIdentifier: string;
    owner1: OwnerAccount;
    owner2: OwnerAccount;
    auditLog: OwnershipAuditEntry[];
  } | null>(null);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const [ownershipFeedback, setOwnershipFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newOwner1Email, setNewOwner1Email] = useState('');
  const [newOwner2Phone, setNewOwner2Phone] = useState('+92 305 6674374');
  const [owner2OtpCode, setOwner2OtpCode] = useState('');
  const [owner2OtpSent, setOwner2OtpSent] = useState(false);
  const [ownerUpdating, setOwnerUpdating] = useState(false);

  // Clearance Checks
  const isAuthorizedAdmin = Boolean(
    currentUser && (currentUser.role === 'super_owner' || currentUser.role === 'owner' || currentUser.role === 'admin')
  );

  const isSuperOwner = Boolean(
    currentUser?.role === 'super_owner' || 
    currentUser?.superOwnerType === 'owner1' ||
    currentUser?.superOwnerType === 'owner2' ||
    currentUser?.email?.toLowerCase() === 'jawadsajid274@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'jawadsajid124@gmail.com' ||
    (currentUser?.phone && (
      currentUser.phone.replace(/[^0-9+]/g, '') === '+923056674374' ||
      currentUser.phone.replace(/[^0-9+]/g, '') === '923056674374' ||
      currentUser.phone.replace(/[^0-9+]/g, '') === '03056674374'
    )) ||
    (settings.ownerEmail && currentUser?.email?.toLowerCase() === settings.ownerEmail.toLowerCase())
  );

  const currentOwnerType: 'owner1' | 'owner2' | null =
    ownershipData?.currentOwnerType ||
    currentUser?.superOwnerType ||
    (currentUser?.phone ? 'owner2' : (isSuperOwner ? 'owner1' : null));

  // Product Form State (Create / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    category: 'Watches',
    price: 0,
    originalPrice: undefined,
    stock: 1,
    image: '',
    badge: 'Limited Edition',
    description: '',
    specs: {},
    featured: true
  });

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Spec helper state
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });
  const [newPasscode, setNewPasscode] = useState('');
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false);

  // Check stored admin token on open
  useEffect(() => {
    if (isOpen) {
      const storedToken = localStorage.getItem('averon_admin_token');
      if (storedToken) {
        setAdminToken(storedToken);
        setIsAdminAuthenticated(true);
        loadData(storedToken);
      } else if (currentUser?.email && isAuthorizedAdmin) {
        // Auto-authenticate verified user with backend
        fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email })
        })
          .then(res => res.json())
          .then(data => {
            if (data.token) {
              setAdminToken(data.token);
              localStorage.setItem('averon_admin_token', data.token);
              setIsAdminAuthenticated(true);
              loadData(data.token);
            }
          })
          .catch(console.error);
      }
    }
  }, [isOpen, currentUser, isAuthorizedAdmin]);

  useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  // Authenticate as owner
  const handleOwnerLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerEmailInput,
          passcode: ownerPasscodeInput
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setAdminToken(data.token);
      localStorage.setItem('averon_admin_token', data.token);
      setIsAdminAuthenticated(true);
      loadData(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Restricted Clearance: Verification failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDirectOwnerUnlock = async (email: string) => {
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setAdminToken(data.token);
        localStorage.setItem('averon_admin_token', data.token);
        setIsAdminAuthenticated(true);
        loadData(data.token);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOwnerLogout = () => {
    localStorage.removeItem('averon_admin_token');
    setAdminToken('');
    setIsAdminAuthenticated(false);
  };

  // Load backend data
  const loadData = async (token = adminToken) => {
    setLoading(true);
    try {
      const headers = { 'x-admin-token': token };
      const [prodRes, ordRes, statsRes, teamRes, galRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders', { headers }),
        fetch('/api/stats', { headers }),
        fetch('/api/team', { headers }).catch(() => null),
        fetch('/api/gallery').catch(() => null)
      ]);
      const [prodData, ordData, statsData, teamData, galData] = await Promise.all([
        prodRes.json(),
        ordRes.json(),
        statsRes.json(),
        teamRes && teamRes.ok ? teamRes.json() : Promise.resolve(null),
        galRes && galRes.ok ? galRes.json() : Promise.resolve([])
      ]);
      setProducts(prodData || []);
      setOrders(ordData || []);
      setStats(statsData || null);
      if (galData && Array.isArray(galData)) {
        setGalleryPhotos(galData);
      }
      if (teamData && Array.isArray(teamData)) {
        setTeamMembers(teamData);
      }
      if (isSuperOwner) {
        await fetchOwnershipData(token);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnershipData = async (token = adminToken) => {
    if (!token) return;
    setOwnershipLoading(true);
    try {
      const res = await fetch('/api/ownership/status', {
        headers: { 'x-admin-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setOwnershipData(data);
        if (data.owner1?.identifier && !newOwner1Email) {
          setNewOwner1Email(data.owner1.identifier);
        }
        if (data.owner2?.identifier && !newOwner2Phone) {
          setNewOwner2Phone(data.owner2.identifier);
        }
      }
    } catch (e) {
      console.warn('Ownership status fetch:', e);
    } finally {
      setOwnershipLoading(false);
    }
  };

  const fetchGalleryPhotos = async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch('/api/gallery');
      if (res.ok) {
        const data = await res.json();
        setGalleryPhotos(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Failed to fetch gallery photos:', e);
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleApproveOrder = async () => {
    if (!selectedOrderForApproval) return;
    if (!approvalDeliveryDate) {
      alert('Please select a required Delivery Date before approving the order.');
      return;
    }
    setApprovingOrder(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderForApproval.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          status: 'Approved',
          estimatedDelivery: approvalDeliveryDate,
          courierPartner: approvalCourier,
          deliveryNotes: approvalDeliveryNotes,
          trackingNumber: approvalTrackingNumber || selectedOrderForApproval.trackingNumber
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        setSelectedOrderForApproval(null);
        setApprovalDeliveryDate('');
        setApprovalDeliveryNotes('');
        onProductChange();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to approve order');
      }
    } catch (e: any) {
      alert(e?.message || 'Error approving order');
    } finally {
      setApprovingOrder(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrderForRejection) return;
    setRejectingOrder(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderForRejection.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          status: 'Rejected',
          rejectionReason: rejectionReason || 'Order could not be approved at this time'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        setSelectedOrderForRejection(null);
        setRejectionReason('');
        onProductChange();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to reject order');
      }
    } catch (e: any) {
      alert(e?.message || 'Error rejecting order');
    } finally {
      setRejectingOrder(false);
    }
  };

  const handleAddGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) {
      setGalleryFeedback({ type: 'error', message: 'Please provide a photo URL or upload an image.' });
      return;
    }
    setGalleryActionLoading(true);
    setGalleryFeedback(null);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          title: newPhotoTitle || 'Atelier Capture',
          url: newPhotoUrl,
          category: newPhotoCategory,
          caption: newPhotoCaption,
          source: gallerySource === 'google_photos' ? 'google_photos' : 'direct_upload',
          featured: true
        })
      });
      if (res.ok) {
        const newPhoto = await res.json();
        setGalleryPhotos((prev) => [newPhoto, ...prev]);
        setNewPhotoTitle('');
        setNewPhotoCaption('');
        setNewPhotoUrl('');
        setGalleryFeedback({ type: 'success', message: 'Photo successfully saved to boutique gallery!' });
      } else {
        const err = await res.json();
        setGalleryFeedback({ type: 'error', message: err.error || 'Failed to save photo' });
      }
    } catch (err: any) {
      setGalleryFeedback({ type: 'error', message: err?.message || 'Network error' });
    } finally {
      setGalleryActionLoading(false);
    }
  };

  const handleSyncGooglePhotos = async () => {
    if (!googlePhotosAlbumUrl && !googlePhotosBatchUrls) {
      setGalleryFeedback({ type: 'error', message: 'Please enter a Google Photos album URL or direct photo link.' });
      return;
    }
    setGalleryActionLoading(true);
    setGalleryFeedback(null);
    try {
      const urls = googlePhotosBatchUrls.split('\n').map((u) => u.trim()).filter(Boolean);
      const res = await fetch('/api/gallery/sync-google-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          albumUrl: googlePhotosAlbumUrl || undefined,
          photoUrls: urls.length > 0 ? urls : undefined,
          category: newPhotoCategory
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.photos && Array.isArray(data.photos)) {
          setGalleryPhotos((prev) => [...data.photos, ...prev]);
        }
        setGooglePhotosAlbumUrl('');
        setGooglePhotosBatchUrls('');
        setGalleryFeedback({ type: 'success', message: data.message || 'Google Photos synced successfully!' });
      } else {
        const err = await res.json();
        setGalleryFeedback({ type: 'error', message: err.error || 'Failed to sync Google Photos' });
      }
    } catch (e: any) {
      setGalleryFeedback({ type: 'error', message: e?.message || 'Failed to sync Google Photos' });
    } finally {
      setGalleryActionLoading(false);
    }
  };

  const handleDeleteGalleryPhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to remove this photo from the gallery?')) return;
    try {
      const res = await fetch(`/api/gallery/${photoId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      if (res.ok) {
        setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Owner 1 Gmail Identity Update (Self-management with Google Reauthentication)
  const handleUpdateOwner1Gmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner1Email || !newOwner1Email.includes('@')) {
      setOwnershipFeedback({ type: 'error', message: 'Please enter a valid Gmail address.' });
      return;
    }

    setOwnerUpdating(true);
    setOwnershipFeedback(null);

    try {
      // 1. Google OAuth Re-authentication
      const reauth = await reauthenticateGoogleOwner();
      if (!reauth.success) {
        throw new Error('Google re-authentication could not be completed.');
      }

      // 2. Dispatch verified update to backend
      const res = await fetch('/api/ownership/update-owner1-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          newEmail: newOwner1Email.trim().toLowerCase(),
          verificationToken: reauth.idToken
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Identity update failed.');

      if (data.token) {
        setAdminToken(data.token);
        localStorage.setItem('averon_admin_token', data.token);
      }

      setOwnershipFeedback({
        type: 'success',
        message: data.message || `Owner 1 Gmail identity updated to ${newOwner1Email} with verified Google re-authentication!`
      });
      await fetchOwnershipData(data.token || adminToken);
    } catch (err: any) {
      setOwnershipFeedback({ type: 'error', message: err.message || 'Failed to update Gmail identity.' });
    } finally {
      setOwnerUpdating(false);
    }
  };

  // Owner 2 Phone Identity Update (Step 1: Send SMS OTP)
  const handleSendOwner2Otp = async () => {
    if (!newOwner2Phone) {
      setOwnershipFeedback({ type: 'error', message: 'Please provide the new mobile phone number.' });
      return;
    }
    setOwnerUpdating(true);
    setOwnershipFeedback(null);
    try {
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newOwner2Phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch SMS OTP');

      setOwner2OtpSent(true);
      if (data.demoOtp) {
        setOwner2OtpCode(data.demoOtp);
      }
      setOwnershipFeedback({
        type: 'success',
        message: data.message || `SMS OTP dispatched to ${newOwner2Phone}. Enter the 6-digit code below to verify.`
      });
    } catch (err: any) {
      setOwnershipFeedback({ type: 'error', message: err.message || 'SMS OTP dispatch failed.' });
    } finally {
      setOwnerUpdating(false);
    }
  };

  // Owner 2 Phone Identity Update (Step 2: Verify & Update)
  const handleConfirmOwner2PhoneUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner2Phone || !owner2OtpCode) {
      setOwnershipFeedback({ type: 'error', message: 'Please enter both the new phone number and the SMS OTP code.' });
      return;
    }

    setOwnerUpdating(true);
    setOwnershipFeedback(null);

    try {
      const res = await fetch('/api/ownership/update-owner2-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          newPhone: newOwner2Phone.trim(),
          otp: owner2OtpCode.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Phone identity update failed.');

      if (data.token) {
        setAdminToken(data.token);
        localStorage.setItem('averon_admin_token', data.token);
      }

      setOwner2OtpSent(false);
      setOwner2OtpCode('');
      setOwnershipFeedback({
        type: 'success',
        message: data.message || `Owner 2 phone identity updated to ${newOwner2Phone} with verified SMS OTP!`
      });
      await fetchOwnershipData(data.token || adminToken);
    } catch (err: any) {
      setOwnershipFeedback({ type: 'error', message: err.message || 'Failed to update phone identity.' });
    } finally {
      setOwnerUpdating(false);
    }
  };

  // Real-time Firestore team synchronization
  useEffect(() => {
    if (!isOpen) return;

    // Load initial members from API
    fetch('/api/team')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTeamMembers(data);
      })
      .catch(() => {});

    try {
      const unsub = onTeamMembersSnapshot(
        (members) => {
          if (members && Array.isArray(members)) {
            setTeamMembers(members);
          }
        },
        (err) => {
          console.warn('Firestore team subscription notice:', err);
        }
      );
      return () => {
        unsub();
      };
    } catch (e) {
      console.warn('Snapshot listener could not be registered:', e);
    }
  }, [isOpen]);

  // Team Action Handlers (Super Owner Authorized)
  const handleInviteTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setTeamFeedback({ type: 'error', message: 'Please provide a valid Gmail or work email address.' });
      return;
    }

    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (cleanEmail === 'jawadsajid274@gmail.com') {
      setTeamFeedback({ type: 'error', message: 'jawadsajid274@gmail.com is already the sovereign Super Owner.' });
      return;
    }

    setTeamLoading(true);
    setTeamFeedback(null);

    try {
      // 1. Write to Firestore via Firebase SDK (enforces firestore.rules isSuperOwner check)
      let firestoreOk = false;
      try {
        await inviteTeamMember(cleanEmail, inviteRole, 'jawadsajid274@gmail.com');
        firestoreOk = true;
      } catch (fErr: any) {
        console.warn('Firestore write warning:', fErr);
      }

      // 2. Dual persistence on backend
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ email: cleanEmail, role: inviteRole })
      });
      const data = await res.json();
      if (!res.ok && !firestoreOk) {
        throw new Error(data.error || 'Failed to dispatch team invitation');
      }

      if (res.ok && data) {
        setTeamMembers((prev) => {
          const filtered = prev.filter((m) => m.email.toLowerCase() !== cleanEmail);
          return [data, ...filtered];
        });
      }

      setInviteEmail('');
      setTeamFeedback({
        type: 'success',
        message: `Executive credential invitation issued for ${cleanEmail} with ${inviteRole} clearance!`
      });
      setTimeout(() => setTeamFeedback(null), 5000);
    } catch (err: any) {
      setTeamFeedback({ type: 'error', message: err.message || 'Invitation failed.' });
    } finally {
      setTeamLoading(false);
    }
  };

  const handleUpdateMemberRole = async (member: TeamMember, newRole: TeamRole) => {
    setTeamActionId(member.id);
    setTeamFeedback(null);
    try {
      try {
        await updateTeamMemberRole(member.id, newRole);
      } catch (fErr) {
        console.warn('Firestore update role note:', fErr);
      }

      const res = await fetch(`/api/team/${member.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, role: newRole, updatedAt: new Date().toISOString() } : m))
        );
        setTeamFeedback({
          type: 'success',
          message: `Role for ${member.email} updated to ${newRole}.`
        });
        setTimeout(() => setTeamFeedback(null), 4000);
      }
    } catch (err: any) {
      setTeamFeedback({ type: 'error', message: err.message || 'Failed to update member role' });
    } finally {
      setTeamActionId(null);
    }
  };

  const handleToggleMemberStatus = async (member: TeamMember) => {
    const nextStatus: TeamMemberStatus = member.status === 'REVOKED' ? 'ACTIVE' : 'REVOKED';
    setTeamActionId(member.id);
    setTeamFeedback(null);
    try {
      try {
        await updateTeamMemberStatus(member.id, nextStatus);
      } catch (fErr) {
        console.warn('Firestore status toggle note:', fErr);
      }

      const res = await fetch(`/api/team/${member.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus, updatedAt: new Date().toISOString() } : m))
        );
        setTeamFeedback({
          type: 'success',
          message: `Security status for ${member.email} changed to ${nextStatus}.`
        });
        setTimeout(() => setTeamFeedback(null), 4000);
      }
    } catch (err: any) {
      setTeamFeedback({ type: 'error', message: err.message || 'Failed to update member status' });
    } finally {
      setTeamActionId(null);
    }
  };

  const handleRemoveTeamMember = async (member: TeamMember) => {
    if (!window.confirm(`Permanently revoke credentials and remove ${member.email} from the AVERON executive roster?`)) {
      return;
    }
    setTeamActionId(member.id);
    setTeamFeedback(null);
    try {
      try {
        await removeTeamMember(member.id);
      } catch (fErr) {
        console.warn('Firestore remove member note:', fErr);
      }

      const res = await fetch(`/api/team/${member.id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': adminToken
        }
      });
      if (res.ok) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
        setTeamFeedback({
          type: 'success',
          message: `${member.email} permanently removed from executive directory.`
        });
        setTimeout(() => setTeamFeedback(null), 4000);
      }
    } catch (err: any) {
      setTeamFeedback({ type: 'error', message: err.message || 'Failed to remove member' });
    } finally {
      setTeamActionId(null);
    }
  };

  // File Upload Handler (Converts file to base64, posts to /api/upload)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, AVIF).');
      return;
    }

    setUploadingImage(true);
    setUploadProgress(`Processing ${file.name} (${Math.round(file.size / 1024)} KB)...`);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': adminToken
            },
            body: JSON.stringify({
              data: base64Data,
              filename: file.name
            })
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Upload failed');

          // Set the saved URL in product form
          setProductForm((prev) => ({ ...prev, image: data.url }));
          setUploadProgress('Image successfully processed and saved to vault storage!');
          setTimeout(() => setUploadProgress(null), 3000);
        } catch (uploadErr) {
          // Fallback: save direct base64 data URL
          setProductForm((prev) => ({ ...prev, image: base64Data }));
          setUploadProgress('Image saved directly as high-resolution vault data!');
          setTimeout(() => setUploadProgress(null), 3000);
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload reading error:', err);
      setUploadingImage(false);
      setUploadProgress(null);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.category || productForm.price === undefined) {
      alert('Please fill out product name, category, and price.');
      return;
    }
    if (!productForm.image) {
      alert('Please upload a product image or provide an image link.');
      return;
    }

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-admin-token': adminToken
      };

      if (editingProductId) {
        // Update product
        const res = await fetch(`/api/products/${editingProductId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(productForm)
        });
        if (!res.ok) throw new Error('Failed to update product');
      } else {
        // Create new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(productForm)
        });
        if (!res.ok) throw new Error('Failed to create product');
      }

      setIsProductModalOpen(false);
      setEditingProductId(null);
      await loadData();
      onProductChange();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the vault catalog? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': adminToken }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      await loadData();
      onProductChange();
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  // Quick Stock Adjuster (+ / -)
  const handleStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ stock: newStock })
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
      );
      onProductChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Save Boutique Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...settingsForm };
      if (newPasscode.trim()) {
        payload.adminPasscode = newPasscode.trim();
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      onUpdateSettings(data.settings);
      setSettingsSavedNotice(true);
      setNewPasscode('');
      setTimeout(() => setSettingsSavedNotice(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed saving settings');
    }
  };

  // Add Spec Key-Value
  const handleAddSpec = () => {
    if (!specKey || !specVal) return;
    setProductForm((prev) => ({
      ...prev,
      specs: {
        ...(prev.specs || {}),
        [specKey.trim()]: specVal.trim()
      }
    }));
    setSpecKey('');
    setSpecVal('');
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    setProductForm((prev) => {
      const updated = { ...(prev.specs || {}) };
      delete updated[keyToRemove];
      return { ...prev, specs: updated };
    });
  };

  // Currency Formatter
  const formatPrice = (amount: number) => {
    return formatCurrencyPrice(amount, currency, exchangeRates);
  };

  if (!isOpen) return null;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'All' || p.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.badge?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  // Filter team members
  const filteredTeamMembers = teamMembers.filter((m) => {
    if (!teamSearchTerm) return true;
    const q = teamSearchTerm.toLowerCase();
    return (
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  if (!isAuthorizedAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
        <AccessDenied
          onReturnHome={onClose}
          onSignIn={onClose}
          attemptedPath="/admin"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-[#090b10] border border-cyan-500/30 rounded-2xl shadow-[0_0_100px_rgba(0,240,255,0.15)] overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {!isAdminAuthenticated ? (
          <div className="p-16 text-center max-w-md mx-auto my-auto space-y-4">
            <div className="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <h3 className="font-cinzel text-lg font-bold text-white tracking-wide">
              Validating Executive Clearance
            </h3>
            <p className="text-xs text-slate-400 font-tech uppercase tracking-wider">
              Cryptographically verifying credentials with AVERON records...
            </p>
          </div>
        ) : (
          <>
            {/* Top Header */}
            <div className="p-6 border-b border-slate-800 bg-[#06070a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-white tracking-wider flex items-center gap-2">
                    <span>AVERON INDUSTRY</span>
                    <span className="text-[10px] font-tech uppercase tracking-widest text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/40">
                      Owner Vault Unlocked
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-tech">
                    Direct Product Upload, Image Storage, Live Pricing & Catalog Management
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => loadData()}
                  className="p-2 rounded-lg border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-white"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                </button>
                <button
                  onClick={handleOwnerLogout}
                  className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs font-tech uppercase tracking-wider"
                >
                  Lock Portal
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick KPI Metric Bar */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-[#07090f] border-b border-slate-800/80 text-xs font-tech">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] block">Live Real Products</span>
                  <span className="text-lg font-bold text-cyan-400 mt-0.5 block">{products.length} In Vault</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] block">Total Inventory Units</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">
                    {products.reduce((sum, p) => sum + (p.stock || 0), 0)} Units
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] block">Active Customer Orders</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">{stats.activeOrders} Active</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 uppercase text-[10px] block">Gross Vault Revenue</span>
                  <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{formatPrice(stats.grossRevenue)}</span>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="px-6 border-b border-slate-800 flex gap-6 text-xs font-tech uppercase tracking-wider bg-[#06070a]">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'products' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Product Catalog & Upload ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'orders' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Customer Orders ({orders.length})</span>
                {orders.some((o) => o.status === 'Pending') && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('gallery');
                  fetchGalleryPhotos();
                }}
                className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'gallery' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Google Photos & Gallery ({galleryPhotos.length})</span>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded uppercase font-tech font-bold">
                  Owner Vault
                </span>
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'team' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Admin & Team ({teamMembers.length})</span>
                {!isSuperOwner && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'settings' ? 'border-cyan-400 text-cyan-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Boutique Contacts & Credentials</span>
                {!isSuperOwner && <Lock className="w-3 h-3 text-amber-400/80 ml-0.5" />}
              </button>

              {/* TAB 5: OWNER ACCOUNT MANAGEMENT - STRICTLY SUPER OWNER ONLY (HIDDEN FROM ADMINS & PUBLIC) */}
              {isSuperOwner && (
                <button
                  onClick={() => {
                    setActiveTab('ownership');
                    fetchOwnershipData();
                  }}
                  className={`py-3.5 flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'ownership' ? 'border-amber-400 text-amber-300 font-bold' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Owner Account Management</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded uppercase font-tech font-bold">
                    Dual Sovereignty
                  </span>
                </button>
              )}
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: PRODUCTS (ADD / UPLOAD / EDIT / DELETE) */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  
                  {/* Top Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search real products by title, category, or badge..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      </div>

                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 uppercase font-tech"
                      >
                        <option value="All">All Categories</option>
                        <option value="Watches">Watches</option>
                        <option value="Wallets">Wallets</option>
                        <option value="Sunglasses">Sunglasses</option>
                        <option value="Perfumes">Perfumes</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>

                    {/* Add Product Button */}
                    <button
                      onClick={() => {
                        setEditingProductId(null);
                        setProductForm({
                          name: '',
                          category: 'Watches',
                          price: 1000,
                          originalPrice: undefined,
                          stock: 5,
                          image: '',
                          badge: 'Limited Edition',
                          description: '',
                          specs: {
                            "Material": "Grade 5 Titanium",
                            "Warranty": "5-Year International"
                          },
                          featured: true
                        });
                        setIsProductModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-wider font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload & Add Product</span>
                    </button>
                  </div>

                  {/* Empty Catalog Notice */}
                  {products.length === 0 ? (
                    <div className="py-16 text-center luxury-glass rounded-2xl border border-dashed border-slate-800 p-8 space-y-4">
                      <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center text-slate-500">
                        <Package className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-cinzel text-base font-bold text-white">
                          No Products in the Database Yet
                        </h4>
                        <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
                          All sample and AI-generated products have been cleared. Upload your genuine images, names, prices, categories, and stock quantities below.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProductId(null);
                          setProductForm({
                            name: '',
                            category: 'Watches',
                            price: 1500,
                            stock: 5,
                            image: '',
                            badge: 'Limited Edition',
                            description: '',
                            specs: {},
                            featured: true
                          });
                          setIsProductModalOpen(true);
                        }}
                        className="px-6 py-3 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-tech text-xs uppercase font-bold tracking-wider inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Upload Your First Real Product</span>
                      </button>
                    </div>
                  ) : (
                    /* Product Table */
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-[#050608] text-[10px] font-tech uppercase tracking-wider text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-3.5">Piece</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Price</th>
                            <th className="p-3.5">Vault Stock</th>
                            <th className="p-3.5">Badge</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredProducts.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.image || 'https://via.placeholder.com/150'}
                                    alt={p.name}
                                    className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-950"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-cinzel font-bold text-white truncate max-w-[220px]">{p.name}</p>
                                    <p className="text-[10px] font-mono text-slate-500">ID: {p.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5">
                                <span className="font-tech text-cyan-400 uppercase text-[11px] font-semibold">
                                  {p.category}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <div className="font-tech text-white font-bold">{formatPrice(p.price)}</div>
                                {p.originalPrice && (
                                  <span className="text-[10px] line-through text-slate-500 font-tech">
                                    {formatPrice(p.originalPrice)}
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleStockAdjust(p, -1)}
                                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                                  >
                                    -
                                  </button>
                                  <span className={`font-tech font-bold px-2 py-0.5 rounded text-[11px] ${
                                    p.stock <= 5 ? 'text-amber-400 bg-amber-950/40 border border-amber-500/30' : 'text-slate-200'
                                  }`}>
                                    {p.stock} units
                                  </span>
                                  <button
                                    onClick={() => handleStockAdjust(p, 1)}
                                    className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-3.5">
                                {p.badge ? (
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-tech text-slate-300 border border-slate-700">
                                    {p.badge}
                                  </span>
                                ) : (
                                  <span className="text-slate-600 italic">None</span>
                                )}
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingProductId(p.id);
                                      setProductForm({ ...p });
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(p.id, p.name)}
                                    className="p-1.5 rounded hover:bg-slate-800 text-red-400 hover:text-red-300"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: CUSTOMER ORDERS (WITH APPROVAL & REJECTION WORKFLOW) */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {/* Status Filter Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-tech">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['all', 'Pending', 'Approved', 'Rejected', 'Shipped'] as const).map((st) => {
                        const count = st === 'all' ? orders.length : orders.filter((o) => o.status === st).length;
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setOrderStatusFilter(st)}
                            className={`px-3 py-1 rounded-lg text-xs uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              orderStatusFilter === st
                                ? 'bg-cyan-400 text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            <span>{st === 'all' ? 'All Orders' : st}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${orderStatusFilter === st ? 'bg-black/30 text-black' : 'bg-slate-800 text-slate-300'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-slate-400 text-[11px]">
                      Showing {orders.filter((o) => orderStatusFilter === 'all' || o.status === orderStatusFilter).length} order(s)
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 font-tech">
                      No customer orders recorded in the database yet.
                    </div>
                  ) : (
                    orders
                      .filter((o) => orderStatusFilter === 'all' || o.status === orderStatusFilter)
                      .map((o) => {
                        const isPending = o.status === 'Pending';
                        const isApproved = o.status === 'Approved';
                        const isRejected = o.status === 'Rejected';

                        return (
                          <div key={o.id} className="p-4 sm:p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-tech">
                              <div>
                                <span className="text-white font-bold text-sm font-mono mr-2">{o.orderNumber}</span>
                                <span className="text-slate-400">{new Date(o.createdAt).toLocaleString()}</span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <span className="text-slate-400 uppercase text-[10px]">Status:</span>
                                <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase border flex items-center gap-1.5 ${
                                  isPending
                                    ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                                    : isApproved
                                    ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                                    : isRejected
                                    ? 'bg-red-950/70 border-red-500/50 text-red-300'
                                    : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                                }`}>
                                  {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                                  {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                  {isRejected && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                                  <span>{o.status}</span>
                                </span>
                                <span className="text-white font-bold text-sm font-tech">{formatPrice(o.total)}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Customer Information */}
                              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-cinzel text-white font-bold text-sm">{o.customer.name}</p>
                                  <span className="text-[10px] font-tech text-cyan-400 uppercase font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                    {o.paymentMethod || 'Cash on Delivery'}
                                  </span>
                                </div>
                                <p className="text-slate-400 font-tech">{o.customer.email} · {o.customer.phone}</p>
                                <p className="text-slate-300 font-sans text-xs">
                                  {o.customer.address}, {o.customer.city}, {o.customer.province || 'Pakistan'}, {o.customer.country}
                                </p>
                              </div>

                              {/* Items list */}
                              <div className="space-y-2">
                                {o.items.map((it, idx) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <img src={it.image} alt={it.name} className="w-9 h-9 rounded object-cover border border-slate-800" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-medium truncate">{it.name}</p>
                                      <p className="text-[10px] text-slate-400 font-tech">Qty: {it.quantity} · {formatPrice(it.price)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Approved Details Banner */}
                            {isApproved && (
                              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs font-tech">
                                <div className="flex items-center justify-between text-emerald-300 font-bold uppercase tracking-wider text-[11px]">
                                  <span className="flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                    <span>Order Approved by Owner</span>
                                  </span>
                                  <span className="text-slate-400 font-normal">
                                    {o.approvedAt ? new Date(o.approvedAt).toLocaleString() : ''}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-200">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block uppercase">Delivery Date:</span>
                                    <span className="font-bold text-white flex items-center gap-1 font-mono">
                                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                                      {o.estimatedDelivery}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block uppercase">Courier Service:</span>
                                    <span className="font-bold text-white flex items-center gap-1">
                                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                                      {o.courierPartner || 'TCS White-Glove VIP Courier'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block uppercase">Tracking Ref:</span>
                                    <span className="font-mono text-cyan-300 text-xs font-bold">{o.trackingNumber}</span>
                                  </div>
                                </div>
                                {o.deliveryNotes && (
                                  <div className="pt-1 text-[11px] text-slate-300 font-sans border-t border-emerald-500/20">
                                    <strong className="text-emerald-300 font-tech uppercase text-[10px]">Dispatch Notes: </strong>
                                    {o.deliveryNotes}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Rejected Details Banner */}
                            {isRejected && (
                              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 space-y-1 text-xs font-tech">
                                <div className="flex items-center justify-between text-red-300 font-bold uppercase tracking-wider text-[11px]">
                                  <span className="flex items-center gap-1.5">
                                    <XCircle className="w-4 h-4 text-red-400" />
                                    <span>Order Rejected</span>
                                  </span>
                                  <span className="text-slate-400 font-normal">
                                    {o.rejectedAt ? new Date(o.rejectedAt).toLocaleString() : ''}
                                  </span>
                                </div>
                                <p className="text-slate-300 font-sans text-xs pt-1">
                                  <strong className="text-red-300 font-tech uppercase text-[10px]">Reason: </strong>
                                  {o.rejectionReason || 'Order could not be approved at this time.'}
                                </p>
                              </div>
                            )}

                            {/* Actions Footer */}
                            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                              <div className="text-[11px] font-tech text-slate-400">
                                <span>Courier Tracking: </span>
                                <span className="text-slate-200 font-mono font-bold">{o.trackingNumber || 'Pending approval'}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedOrderForApproval(o);
                                        const defaultDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
                                        setApprovalDeliveryDate(o.estimatedDelivery || defaultDate);
                                        setApprovalCourier(o.courierPartner || 'TCS White-Glove VIP Courier');
                                        setApprovalDeliveryNotes(o.deliveryNotes || '');
                                        setApprovalTrackingNumber(o.trackingNumber || `AVR-PK-${Math.floor(1000000 + Math.random() * 9000000)}`);
                                      }}
                                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-tech text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Approve Order</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedOrderForRejection(o);
                                        setRejectionReason('');
                                      }}
                                      className="px-3.5 py-1.5 rounded-lg border border-red-500/50 hover:bg-red-950/40 text-red-300 font-tech text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                                    >
                                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                                      <span>Reject Order</span>
                                    </button>
                                  </>
                                )}

                                {isApproved && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const res = await fetch(`/api/orders/${o.id}/status`, {
                                        method: 'PATCH',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'x-admin-token': adminToken
                                        },
                                        body: JSON.stringify({ status: 'Shipped' })
                                      });
                                      if (res.ok) {
                                        const updated = await res.json();
                                        setOrders((prev) => prev.map((ord) => (ord.id === updated.id ? updated : ord)));
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg border border-cyan-500/50 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/80 font-tech text-xs uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Dispatch / Mark Shipped</span>
                                  </button>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })
                  )}
                </div>
              )}

              {/* POPUP: ORDER APPROVAL MODAL */}
              {selectedOrderForApproval && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="relative w-full max-w-lg bg-[#090b10] border border-emerald-500/40 rounded-2xl shadow-[0_0_80px_rgba(16,185,129,0.25)] overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#06070a] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wide">
                            Approve Order {selectedOrderForApproval.orderNumber}
                          </h3>
                          <p className="text-[10px] font-tech text-emerald-400 uppercase tracking-wider">
                            Executive White-Glove Approval Workflow
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedOrderForApproval(null)}
                        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApproveOrder();
                      }}
                      className="p-5 sm:p-6 space-y-4"
                    >
                      {/* Destination Summary */}
                      <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs font-tech space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Client:</span>
                          <span className="text-white font-bold">{selectedOrderForApproval.customer.name} ({selectedOrderForApproval.customer.phone})</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Destination:</span>
                          <span className="text-slate-300 font-sans text-right">{selectedOrderForApproval.customer.address}, {selectedOrderForApproval.customer.city}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Total Settlement:</span>
                          <span className="text-cyan-400 font-bold">{formatPrice(selectedOrderForApproval.total)}</span>
                        </div>
                      </div>

                      {/* Required Delivery Date */}
                      <div>
                        <label className="block text-[10px] font-tech uppercase tracking-wider text-emerald-300 mb-1 font-bold flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Delivery Date (Required) *</span>
                        </label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={approvalDeliveryDate}
                          onChange={(e) => setApprovalDeliveryDate(e.target.value)}
                          className="w-full bg-slate-900 border border-emerald-500/50 focus:border-emerald-400 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                          The client will see this confirmed delivery date on their account dossier.
                        </p>
                      </div>

                      {/* Courier Partner Selection */}
                      <div>
                        <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-300 mb-1 font-bold">
                          Assigned Courier Service (Pakistan)
                        </label>
                        <select
                          value={approvalCourier}
                          onChange={(e) => setApprovalCourier(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white font-tech focus:outline-none"
                        >
                          <option value="TCS White-Glove VIP Courier">TCS White-Glove VIP Courier (Recommended)</option>
                          <option value="Leopard Express Luxe">Leopard Express Luxe</option>
                          <option value="Trax Sovereign Logistics">Trax Sovereign Logistics</option>
                          <option value="M&P Express VIP">M&P Express VIP</option>
                          <option value="Atelier Direct White-Glove Courier">Atelier Direct White-Glove Courier</option>
                        </select>
                      </div>

                      {/* Tracking Reference Number */}
                      <div>
                        <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-300 mb-1">
                          Tracking Reference Number
                        </label>
                        <input
                          type="text"
                          value={approvalTrackingNumber}
                          onChange={(e) => setApprovalTrackingNumber(e.target.value)}
                          placeholder="e.g. AVR-PK-8924182"
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                        />
                      </div>

                      {/* Relevant Delivery & Handling Notes */}
                      <div>
                        <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-300 mb-1">
                          Delivery & Handling Notes (Order Details)
                        </label>
                        <textarea
                          rows={2}
                          value={approvalDeliveryNotes}
                          onChange={(e) => setApprovalDeliveryNotes(e.target.value)}
                          placeholder="e.g. Call patron 1 hour before arrival; handle with tamper-evident seal intact."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-sans"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForApproval(null)}
                          disabled={approvingOrder}
                          className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-tech uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={approvingOrder}
                          className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
                        >
                          {approvingOrder ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                              <span>Approving...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirm & Approve Order</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* POPUP: ORDER REJECTION MODAL */}
              {selectedOrderForRejection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="relative w-full max-w-md bg-[#090b10] border border-red-500/40 rounded-2xl shadow-[0_0_80px_rgba(239,68,68,0.25)] overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#06070a] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
                          <XCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-cinzel text-sm sm:text-base font-bold text-white tracking-wide">
                            Reject Order {selectedOrderForRejection.orderNumber}
                          </h3>
                          <p className="text-[10px] font-tech text-red-400 uppercase tracking-wider">
                            Set Formal Rejection Status
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedOrderForRejection(null)}
                        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRejectOrder();
                      }}
                      className="p-5 sm:p-6 space-y-4"
                    >
                      <p className="text-xs text-slate-300 font-sans">
                        Are you sure you want to reject this order? This will update the status to <strong className="text-red-400">Rejected</strong> and inform the client on their vault dossier.
                      </p>

                      <div>
                        <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-300 mb-1">
                          Rejection Reason (Visible on Order Record)
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Unreachable contact number for verification; or delivery address outside service perimeter."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-red-400 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-sans"
                        />
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForRejection(null)}
                          disabled={rejectingOrder}
                          className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-tech uppercase tracking-wider"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={rejectingOrder}
                          className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.3)] disabled:opacity-50 cursor-pointer"
                        >
                          {rejectingOrder ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Rejecting...</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Confirm Rejection</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2b: OWNER-ONLY GOOGLE PHOTOS & GALLERY VAULT */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  {/* Google Account Security Clearance Banner */}
                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-950/50 via-cyan-950/30 to-slate-900/60 border border-blue-500/40 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-900/60 border border-blue-400/50 flex items-center justify-center text-blue-300">
                          <Camera className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-cinzel text-sm font-bold text-white tracking-wide">
                            Owner-Only Google Photos & Boutique Gallery Vault
                          </h4>
                          <p className="text-[10px] font-tech text-cyan-300 uppercase tracking-wider">
                            Authorized Owner Access Verified · {currentUser?.email || 'jawadsajid274@gmail.com'}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded text-[10px] font-tech uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Google Owner Session Active
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
                      Only authorized owners can connect their Google account, import Google Photos albums, and publish new imagery. Uploaded photos appear automatically inside the public AVERON website gallery without requiring clients to install external apps or sign in.
                    </p>
                  </div>

                  {galleryFeedback && (
                    <div className={`p-3 rounded-lg text-xs font-tech flex items-center gap-2 ${
                      galleryFeedback.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                        : 'bg-red-950/60 border border-red-500/50 text-red-300'
                    }`}>
                      {galleryFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{galleryFeedback.message}</span>
                    </div>
                  )}

                  {/* Mode Switcher: Google Photos vs Direct Upload */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Method 1: Google Photos Sync */}
                    <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Camera className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-cinzel text-xs font-bold uppercase text-white tracking-wider">
                          Option 1: Import from Google Photos
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                            Google Photos Album or Photo Links (1 per line)
                          </label>
                          <textarea
                            rows={3}
                            value={googlePhotosBatchUrls}
                            onChange={(e) => setGooglePhotosBatchUrls(e.target.value)}
                            placeholder="https://photos.google.com/... or https://lh3.googleusercontent.com/..."
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                            Collection Category
                          </label>
                          <select
                            value={newPhotoCategory}
                            onChange={(e) => setNewPhotoCategory(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white font-tech focus:outline-none"
                          >
                            <option value="Watches">Watches (Timepieces)</option>
                            <option value="Wallets">Wallets (Leathercraft)</option>
                            <option value="Sunglasses">Sunglasses (Optics)</option>
                            <option value="Perfumes">Perfumes (Haute Parfumerie)</option>
                            <option value="Accessories">Accessories (Bespoke)</option>
                            <option value="Atelier">Atelier & Architecture</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleSyncGooglePhotos}
                          disabled={galleryActionLoading}
                          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Sync Photos from Google Account</span>
                        </button>
                      </div>
                    </div>

                    {/* Method 2: Direct High-Res Upload */}
                    <form onSubmit={handleAddGalleryPhoto} className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <h4 className="font-cinzel text-xs font-bold uppercase text-white tracking-wider">
                          Option 2: Direct Device / Camera Upload
                        </h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                            Photo Title
                          </label>
                          <input
                            type="text"
                            required
                            value={newPhotoTitle}
                            onChange={(e) => setNewPhotoTitle(e.target.value)}
                            placeholder="e.g. Damascus Steel Atelier Detail"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                              Category
                            </label>
                            <select
                              value={newPhotoCategory}
                              onChange={(e) => setNewPhotoCategory(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg px-2 py-2 text-xs text-white font-tech focus:outline-none"
                            >
                              <option value="Watches">Watches</option>
                              <option value="Wallets">Wallets</option>
                              <option value="Sunglasses">Sunglasses</option>
                              <option value="Perfumes">Perfumes</option>
                              <option value="Accessories">Accessories</option>
                              <option value="Atelier">Atelier</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                              Image File
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = async () => {
                                  try {
                                    const base64 = reader.result as string;
                                    const res = await fetch('/api/upload', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ data: base64, filename: file.name })
                                    });
                                    const data = await res.json();
                                    if (data.url) setNewPhotoUrl(data.url);
                                  } catch (err) {
                                    console.error(err);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                            Or Direct Image URL
                          </label>
                          <input
                            type="url"
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                            placeholder="https://... or uploaded file path"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1">
                            Photo Caption / Description
                          </label>
                          <input
                            type="text"
                            value={newPhotoCaption}
                            onChange={(e) => setNewPhotoCaption(e.target.value)}
                            placeholder="Short description of metallurgy, movement, or leather finish"
                            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={galleryActionLoading || !newPhotoUrl}
                          className="w-full py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black font-tech text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Publish to Website Gallery</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Existing Gallery Photos Table */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="font-cinzel text-xs font-bold uppercase text-white tracking-wider">
                        Active Photos in AVERON Website Gallery ({galleryPhotos.length})
                      </h4>
                      <button
                        onClick={fetchGalleryPhotos}
                        className="text-xs text-cyan-400 hover:underline font-tech flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Refresh</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {galleryPhotos.map((p) => (
                        <div key={p.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 group relative">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-black">
                            <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-tech uppercase font-bold bg-black/80 text-cyan-300 border border-slate-700">
                              {p.category}
                            </span>
                            {p.source === 'google_photos' && (
                              <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-[8px] font-tech uppercase font-bold bg-blue-950/90 text-blue-300 border border-blue-500/40">
                                Google
                              </span>
                            )}
                          </div>
                          <div>
                            <h5 className="font-cinzel text-xs font-bold text-white truncate">{p.title}</h5>
                            <p className="text-[10px] text-slate-400 font-sans line-clamp-1">{p.caption || 'No caption'}</p>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                            <span className="text-[9px] font-tech text-slate-500">{new Date(p.uploadedAt).toLocaleDateString()}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteGalleryPhoto(p.id)}
                              className="p-1 rounded text-red-400 hover:bg-red-950/40 transition-colors"
                              title="Delete from Gallery"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SETTINGS & BOUTIQUE CONTACTS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
                  {settingsSavedNotice && (
                    <div className="p-3.5 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-xs font-tech text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Settings & Boutique details permanently saved to database!</span>
                    </div>
                  )}

                  {/* Owner Security Credentials */}
                  <div className="p-5 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-4">
                    <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-cyan-400" />
                      Owner Access Credentials & Passkey
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                          Verified Owner Email
                        </label>
                        <input
                          type="email"
                          value={settingsForm.ownerEmail || 'jawadsajid274@gmail.com'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, ownerEmail: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                          Change Owner Master Passkey
                        </label>
                        <input
                          type="text"
                          placeholder="Leave blank to keep current passkey"
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 1: BUSINESS CONTACT SETTINGS */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-cinzel text-sm font-bold text-white tracking-wide">
                            Business Contact Settings
                          </h4>
                          <p className="text-[10px] font-tech text-slate-400 uppercase tracking-wider">
                            Public WhatsApp Business Line & Global Inquiries
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-tech text-emerald-400 uppercase tracking-widest px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 font-bold">
                        Super Owner Exclusive
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-300 mb-1 font-bold">
                          Public WhatsApp Number *
                        </label>
                        <input
                          type="text"
                          value={settingsForm.whatsapp || '+92 305 6674374'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const digits = val.replace(/[^0-9]/g, '');
                            setSettingsForm({
                              ...settingsForm,
                              whatsapp: val,
                              phone: val,
                              whatsappChatUrl: `https://wa.me/${digits}`
                            });
                          }}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded px-3 py-2 text-xs text-white font-mono"
                          placeholder="+92 305 6674374"
                        />
                        <span className="text-[10px] text-slate-500 font-tech mt-1 block">
                          Official business contact number displayed on the storefront.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-300 mb-1 font-bold">
                          Country Code *
                        </label>
                        <input
                          type="text"
                          value={settingsForm.whatsappCountryCode || '+92'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsappCountryCode: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded px-3 py-2 text-xs text-white font-mono"
                          placeholder="+92"
                        />
                        <span className="text-[10px] text-slate-500 font-tech mt-1 block">
                          Default country dial code for the WhatsApp concierge link.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-tech uppercase text-slate-300 mb-1 font-bold">
                        WhatsApp Official Chat URL (Auto-Generated)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={settingsForm.whatsappChatUrl || 'https://wa.me/923056674374'}
                        className="w-full bg-slate-950/60 border border-slate-800/80 rounded px-3 py-2 text-xs text-cyan-300 font-mono"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-tech text-white uppercase tracking-wider block font-bold">
                          Enable Public Contact Display
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans block">
                          Show the dedicated "CONTACT AVERON INDUSTRY" section and WhatsApp button on storefront.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.showPublicContact !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, showPublicContact: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-300 mb-1 font-bold flex items-center justify-between">
                          <span>Official Public Contact Email *</span>
                          <span className="text-cyan-400 font-normal lowercase text-[9px]">(general inquiries)</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={settingsForm.email || 'contact@averonindustry.com'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded px-3 py-2 text-xs text-white font-mono"
                          placeholder="contact@averonindustry.com"
                        />
                        <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">
                          Used in contact sections, general correspondence, and boutique footer.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-300 mb-1 font-bold flex items-center justify-between">
                          <span>Bespoke Concierge Email *</span>
                          <span className="text-cyan-400 font-normal lowercase text-[9px]">(VIP advisory)</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={settingsForm.supportEmail || 'concierge@averonindustry.com'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded px-3 py-2 text-xs text-white font-mono"
                          placeholder="concierge@averonindustry.com"
                        />
                        <span className="text-[10px] text-slate-500 font-sans mt-0.5 block">
                          Used for private consultations, bespoke commissions, and concierge modal.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: DELIVERY SETTINGS */}
                  <div className="p-5 sm:p-6 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-cinzel text-sm font-bold text-white tracking-wide">
                            Delivery Settings
                          </h4>
                          <p className="text-[10px] font-tech text-slate-400 uppercase tracking-wider">
                            Nationwide Pakistan Fulfillment & International Restriction Rules
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-tech text-cyan-400 uppercase tracking-widest px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 font-bold">
                        Strict Rules
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-300 mb-1 font-bold">
                          Country
                        </label>
                        <input
                          type="text"
                          value={settingsForm.deliveryCountry || 'Pakistan'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryCountry: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-cyan-300 font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-300 mb-1 font-bold">
                          Delivery Area
                        </label>
                        <input
                          type="text"
                          value={settingsForm.deliveryArea || 'All eligible locations across Pakistan'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryArea: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-tech uppercase text-slate-300 mb-1 font-bold">
                          Delivery Availability
                        </label>
                        <input
                          type="text"
                          value={settingsForm.deliveryAvailability || 'Pakistan only'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryAvailability: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-tech text-white uppercase tracking-wider block font-bold">
                            Block International Delivery Orders
                          </span>
                          <span className="text-[10px] text-slate-400 font-sans block">
                            Enforces delivery validation on trusted backend and rejects checkout for addresses outside Pakistan.
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settingsForm.blockInternationalOrders !== false}
                            onChange={(e) => setSettingsForm({ ...settingsForm, blockInternationalOrders: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                        </label>
                      </div>

                      <p className="text-[10px] font-tech text-slate-500">
                        * Note: WhatsApp country code never determines delivery eligibility. International clients worldwide can contact AVERON via WhatsApp and place orders, provided the designated delivery destination is within Pakistan.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!isSuperOwner}
                    className={`px-8 py-3.5 rounded-lg font-tech text-xs uppercase tracking-widest font-bold flex items-center gap-2 ${
                      !isSuperOwner
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{!isSuperOwner ? 'Super Owner Privilege Required to Save' : 'Save All Changes Permanently'}</span>
                  </button>
                </form>
              )}

              {/* TAB 4: ADMIN & TEAM MANAGEMENT (SUPER OWNER EXCLUSIVE) */}
              {activeTab === 'team' && (
                !isSuperOwner ? (
                  <div className="p-8 sm:p-12 text-center max-w-lg mx-auto bg-slate-900/60 border border-amber-500/30 rounded-2xl space-y-4 my-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                      <Crown className="w-8 h-8" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] font-tech uppercase tracking-widest text-amber-400 font-bold">
                      <Lock className="w-3 h-3" />
                      <span>SUPER OWNER PRIVILEGE</span>
                    </div>
                    <h3 className="font-cinzel text-xl font-bold text-white tracking-wide">
                      Super Owner Clearance Required
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Executive and team management privileges are strictly restricted to the verified Super Owner. Team member invitations, role promotions, status updates, and credentials revocations are protected by cryptographic Firestore rules.
                    </p>
                  </div>
                ) : (
                <div className="space-y-6 max-w-5xl">
                  {/* Feedback Toast Banner */}
                  {teamFeedback && (
                    <div
                      className={`p-4 rounded-xl border flex items-center justify-between text-xs font-tech animate-in fade-in duration-200 ${
                        teamFeedback.type === 'success'
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : 'bg-red-950/60 border-red-500/50 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {teamFeedback.type === 'success' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                        <span>{teamFeedback.message}</span>
                      </div>
                      <button
                        onClick={() => setTeamFeedback(null)}
                        className="text-slate-400 hover:text-white ml-3 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* 1. SOVEREIGN SUPER OWNER ROOT CLEARANCE CARD */}
                  <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900/90 to-cyan-950/30 border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-900/60 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] shrink-0">
                          <Crown className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-tech text-amber-400 text-[10px] uppercase tracking-[0.25em] font-bold">
                              SOVEREIGN SUPER OWNER ROOT COMMAND
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-tech text-emerald-400 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              VERIFIED IN FIRESTORE
                            </span>
                          </div>
                          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white mt-1">
                            {currentUser?.email || settings.ownerEmail || 'jawadsajid274@gmail.com'}
                          </h3>
                          <p className="mt-1 text-xs text-slate-300 font-sans leading-relaxed max-w-2xl">
                            Root authority initialized exclusively for your Google account. Backed by Firestore Security Rules (<code className="text-amber-300 font-mono text-[11px]">isSuperOwner()</code>), only you possess cryptographic clearance to invite new administrators, assign executive roles, and revoke platform credentials.
                          </p>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-[10px] font-tech uppercase tracking-wider text-slate-400 block">
                          Operational Clearance
                        </span>
                        <span className="inline-block px-3 py-1 mt-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 font-tech text-xs uppercase tracking-widest font-bold">
                          Super Owner #1
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. INVITE TEAM MEMBER FORM */}
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-cyan-500/30 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-cyan-400" />
                          <span>Dispatch Executive Team Invitation</span>
                        </h4>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                          Invite collaborators using their Gmail address and assign them either <span className="text-cyan-300 font-semibold">ADMIN</span> or <span className="text-amber-300 font-semibold">OWNER</span> operational clearance.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleInviteTeamMember} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        {/* Email Input */}
                        <div className="md:col-span-7">
                          <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                            Collaborator Gmail Address *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                              type="email"
                              required
                              placeholder="colleague@gmail.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono transition-all outline-none"
                            />
                          </div>
                        </div>

                        {/* Role Selector */}
                        <div className="md:col-span-5">
                          <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
                            Designated Role *
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setInviteRole('ADMIN')}
                              className={`p-2.5 rounded-xl border text-xs font-tech flex items-center justify-center gap-2 transition-all ${
                                inviteRole === 'ADMIN'
                                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Shield className="w-3.5 h-3.5" />
                              <span>ADMIN</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setInviteRole('OWNER')}
                              className={`p-2.5 rounded-xl border text-xs font-tech flex items-center justify-center gap-2 transition-all ${
                                inviteRole === 'OWNER'
                                  ? 'bg-amber-950/60 border-amber-400 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Crown className="w-3.5 h-3.5" />
                              <span>OWNER</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Role Descriptions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px] font-sans">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-tech text-cyan-300 font-bold uppercase text-[10px]">
                            <Shield className="w-3.5 h-3.5" />
                            <span>ADMIN Clearance</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed">
                            Upload products, edit pricing & stock, process client orders, and manage luxury boutique inventory.
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-tech text-amber-300 font-bold uppercase text-[10px]">
                            <Crown className="w-3.5 h-3.5" />
                            <span>OWNER Clearance</span>
                          </div>
                          <p className="text-slate-400 leading-relaxed">
                            Full co-ownership governance, store credentials, boutique flagship contact settings, and catalog authority.
                          </p>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-500 font-tech">
                          {isSuperOwner ? (
                            <span className="text-emerald-400 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5" /> Authorized by Sovereign Super Owner
                            </span>
                          ) : (
                            <span className="text-amber-400 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5" /> Super Owner verification required to dispatch invites
                            </span>
                          )}
                        </span>

                        <button
                          type="submit"
                          disabled={teamLoading || !isSuperOwner}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-tech text-xs uppercase tracking-wider font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserPlus className={`w-4 h-4 ${teamLoading ? 'animate-spin' : ''}`} />
                          <span>{teamLoading ? 'Registering...' : 'Dispatch Invitation'}</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* 3. TEAM ROSTER & PERMISSION DIRECTORY */}
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="font-cinzel text-base font-bold text-white flex items-center gap-2">
                          <Users className="w-5 h-5 text-cyan-400" />
                          <span>Executive Team & Access Directory</span>
                          <span className="text-xs font-tech text-cyan-400 font-normal px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30">
                            {teamMembers.length + 1} Total Accounts
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400 font-sans mt-0.5">
                          Live real-time roster of active administrators and co-owners synchronized with Firestore.
                        </p>
                      </div>

                      {/* Filter Search */}
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search members or roles..."
                          value={teamSearchTerm}
                          onChange={(e) => setTeamSearchTerm(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-600 font-tech outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* SOVEREIGN SUPER OWNER ROW (PERMANENT & IMMUTABLE) */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-950/70 to-slate-900/60 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 text-black font-bold font-tech flex items-center justify-center text-sm shadow-[0_0_15px_rgba(245,158,11,0.4)] shrink-0">
                            <Crown className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-tech text-xs font-bold text-white">
                                Jawad Sajid
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                                <Crown className="w-3 h-3" /> SUPER OWNER
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-300 font-mono">jawadsajid274@gmail.com</span>
                              <span className="text-[10px] font-tech text-cyan-400">(Primary Founder)</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:justify-end">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-tech text-emerald-300 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            ROOT AUTHORITY
                          </span>
                          <span className="text-[11px] font-tech text-slate-500 italic">
                            Non-Revocable
                          </span>
                        </div>
                      </div>

                      {/* INVITED / REGISTERED TEAM MEMBERS */}
                      {filteredTeamMembers.length === 0 ? (
                        <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
                          <Users className="w-8 h-8 text-slate-600 mx-auto" />
                          <h5 className="font-cinzel text-sm text-slate-300">No Additional Team Members Yet</h5>
                          <p className="text-xs text-slate-500 font-sans max-w-md mx-auto">
                            Dispatch invitations above to grant colleagues ADMIN or OWNER privileges to the AVERON dashboard.
                          </p>
                        </div>
                      ) : (
                        filteredTeamMembers.map((member) => {
                          const isActionLoading = teamActionId === member.id;
                          return (
                            <div
                              key={member.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                                member.status === 'REVOKED'
                                  ? 'bg-red-950/10 border-red-900/40 opacity-75'
                                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              {/* Member Identity */}
                              <div className="flex items-center gap-3.5">
                                <div
                                  className={`w-10 h-10 rounded-full font-bold font-tech flex items-center justify-center text-sm shrink-0 border ${
                                    member.role === 'OWNER'
                                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                                      : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                                  }`}
                                >
                                  {member.email.slice(0, 2).toUpperCase()}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-mono font-bold text-white">
                                      {member.email}
                                    </span>

                                    {/* Role Badge */}
                                    {member.role === 'OWNER' ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider bg-amber-950/70 text-amber-300 border border-amber-500/50 flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> OWNER
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-tech font-bold uppercase tracking-wider bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> ADMIN
                                      </span>
                                    )}

                                    {/* Status Badge */}
                                    {member.status === 'ACTIVE' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                                        Active
                                      </span>
                                    )}
                                    {member.status === 'INVITED' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40">
                                        Invited
                                      </span>
                                    )}
                                    {member.status === 'REVOKED' && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-tech font-bold uppercase tracking-wider bg-red-950/80 text-red-300 border border-red-500/40">
                                        Revoked
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-[11px] text-slate-500 font-tech mt-1 flex items-center gap-2">
                                    <span>Invited: {new Date(member.invitedAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>By: {member.invitedBy}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Member Controls (Super Owner Only) */}
                              <div className="flex items-center gap-2 flex-wrap lg:justify-end">
                                {/* Role Switch Button */}
                                <button
                                  onClick={() => handleUpdateMemberRole(member, member.role === 'ADMIN' ? 'OWNER' : 'ADMIN')}
                                  disabled={isActionLoading || !isSuperOwner}
                                  className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-cyan-400 bg-slate-900 text-xs font-tech text-slate-300 hover:text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
                                  title={`Switch role to ${member.role === 'ADMIN' ? 'OWNER' : 'ADMIN'}`}
                                >
                                  {member.role === 'ADMIN' ? (
                                    <>
                                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Promote to OWNER</span>
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Demote to ADMIN</span>
                                    </>
                                  )}
                                </button>

                                {/* Revoke / Restore Access */}
                                <button
                                  onClick={() => handleToggleMemberStatus(member)}
                                  disabled={isActionLoading || !isSuperOwner}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-tech flex items-center gap-1.5 transition-all disabled:opacity-50 ${
                                    member.status === 'REVOKED'
                                      ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50'
                                      : 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50'
                                  }`}
                                  title={member.status === 'REVOKED' ? 'Restore access' : 'Temporarily revoke access'}
                                >
                                  {member.status === 'REVOKED' ? (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Restore Access</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3.5 h-3.5" />
                                      <span>Revoke Access</span>
                                    </>
                                  )}
                                </button>

                                {/* Remove Member */}
                                <button
                                  onClick={() => handleRemoveTeamMember(member)}
                                  disabled={isActionLoading || !isSuperOwner}
                                  className="p-1.5 rounded-lg border border-red-500/30 hover:border-red-500 bg-red-950/20 text-red-400 hover:text-red-200 transition-all disabled:opacity-50"
                                  title="Permanently remove team member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* 4. FIRESTORE SECURITY RULES & RBAC ARCHITECTURE */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-slate-300 font-tech text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>Security & Firestore Authorization Architecture</span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      All permissions on the collection <code className="text-cyan-300 font-mono text-[11px]">/team_members</code> are strictly governed by <code className="text-cyan-300 font-mono text-[11px]">firestore.rules</code>. Only the verified Super Owners can create, modify, or delete team members. Team members signing in with Google or Email automatically inherit their assigned administrative role.
                    </p>
                  </div>
                </div>
              )
            )}

              {/* ======================================================== */}
              {/* TAB 5: OWNER ACCOUNT MANAGEMENT (DUAL SUPER OWNER SOVEREIGNTY) */}
              {/* (Strictly Super Owner Only - Invisible to Ordinary Admins) */}
              {/* ======================================================== */}
              {activeTab === 'ownership' && (
                !isSuperOwner ? (
                  <AccessDenied
                    onReturnHome={onClose}
                    onSignIn={onClose}
                    attemptedPath="/admin/ownership"
                  />
                ) : (
                  <div className="space-y-6 max-w-5xl">
                    {/* Header Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d131f] via-[#090e17] to-[#0d131f] border border-amber-500/30 space-y-3 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                            <Crown className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white tracking-wide">
                                OWNER ACCOUNT MANAGEMENT
                              </h3>
                              <span className="text-[10px] font-tech font-bold uppercase tracking-widest text-amber-300 px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/40">
                                Dual Sovereignty
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-tech">
                              Two equal Super Owners with separate authentication methods and individually managed identities.
                            </p>
                          </div>
                        </div>

                        {/* Active Session Indicator */}
                        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-right">
                          <span className="text-[10px] text-slate-400 font-tech uppercase block">Your Active Session</span>
                          <span className="text-xs font-bold text-cyan-300 font-tech flex items-center gap-1.5 justify-end">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {currentOwnerType === 'owner1' ? 'Super Owner 1 (Gmail)' : 'Super Owner 2 (Phone)'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                        <p className="font-tech text-slate-400">
                          <strong className="text-amber-300 font-bold">SOVEREIGNTY PROTOCOL:</strong> Both authorized Super Owners hold equal, independent, and unrestricted master permissions across all boutique operations. Each owner manages <strong className="text-white">only their own authentication identity</strong> through cryptographic re-verification. Neither owner can modify or revoke the other's sovereign status.
                        </p>
                      </div>
                    </div>

                    {/* Feedback Notice */}
                    {ownershipFeedback && (
                      <div
                        className={`p-4 rounded-xl border text-xs font-tech flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
                          ownershipFeedback.type === 'success'
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : 'bg-red-950/40 border-red-500/50 text-red-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {ownershipFeedback.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                          )}
                          <span>{ownershipFeedback.message}</span>
                        </div>
                        <button
                          onClick={() => setOwnershipFeedback(null)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* TWO EQUAL SOVEREIGN OWNER CARDS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* ======================================================== */}
                      {/* CARD 1: OWNER 1 — GMAIL AUTHENTICATION                  */}
                      {/* ======================================================== */}
                      <div
                        className={`p-6 rounded-2xl bg-[#090c14] border transition-all space-y-5 ${
                          currentOwnerType === 'owner1'
                            ? 'border-cyan-400/50 shadow-[0_0_35px_rgba(0,240,255,0.12)]'
                            : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-cinzel text-base font-bold text-white">OWNER 1</h4>
                                <span className="text-[10px] font-tech text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-950/40 uppercase">
                                  SUPER_OWNER
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-tech">Gmail OAuth Authentication</p>
                            </div>
                          </div>

                          {currentOwnerType === 'owner1' ? (
                            <span className="text-[10px] font-tech uppercase tracking-wider text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              You (Owner 1)
                            </span>
                          ) : (
                            <span className="text-[10px] font-tech uppercase tracking-wider text-slate-400 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60">
                              Co-Equal Owner
                            </span>
                          )}
                        </div>

                        {/* Current Identity Details */}
                        <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-tech">
                          <div className="flex justify-between items-center py-1 border-b border-slate-900">
                            <span className="text-slate-400 uppercase text-[10px]">Registered Gmail:</span>
                            <span className="font-mono text-cyan-300 font-bold">
                              {ownershipData?.owner1.identifier || 'jawadsajid124@gmail.com'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-900">
                            <span className="text-slate-400 uppercase text-[10px]">Backup / Recognized Email:</span>
                            <span className="font-mono text-slate-300">
                              {ownershipData?.owner1.backupEmail || 'jawadsajid274@gmail.com'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-900">
                            <span className="text-slate-400 uppercase text-[10px]">Verification Status:</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Cryptographically Active
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-400 uppercase text-[10px]">Last Login:</span>
                            <span className="text-slate-400">
                              {ownershipData?.owner1.lastLoginAt ? new Date(ownershipData.owner1.lastLoginAt).toLocaleString() : 'Active session'}
                            </span>
                          </div>
                        </div>

                        {/* Individual Management Interface */}
                        {currentOwnerType === 'owner1' ? (
                          <form onSubmit={handleUpdateOwner1Gmail} className="space-y-3 pt-2 border-t border-slate-800">
                            <div>
                              <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-300 mb-1 font-bold">
                                Update Your Registered Gmail Identity
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  required
                                  value={newOwner1Email}
                                  onChange={(e) => setNewOwner1Email(e.target.value)}
                                  placeholder="new.owner1@gmail.com"
                                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                                />
                                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                Requires Google re-authentication. Old credentials will be invalidated immediately.
                              </span>
                            </div>

                            <button
                              type="submit"
                              disabled={ownerUpdating}
                              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-wider font-extrabold transition-all flex items-center justify-center gap-2 shadow-md"
                            >
                              {ownerUpdating ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Re-authenticating via Google...</span>
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Verify & Update with Google Re-authentication</span>
                                </>
                              )}
                            </button>
                          </form>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                            <div className="flex items-center gap-2 text-amber-400 font-tech font-bold text-[11px] uppercase">
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Sovereign Identity Locked to Owner 1</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">
                              Managed exclusively by Owner 1 via Google re-authentication. Owner 2 or other accounts are cryptographically prohibited from altering Owner 1's Gmail identity.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* ======================================================== */}
                      {/* CARD 2: OWNER 2 — PHONE AUTHENTICATION                  */}
                      {/* ======================================================== */}
                      <div
                        className={`p-6 rounded-2xl bg-[#090c14] border transition-all space-y-5 ${
                          currentOwnerType === 'owner2'
                            ? 'border-emerald-400/50 shadow-[0_0_35px_rgba(16,185,129,0.12)]'
                            : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                              <Phone className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-cinzel text-base font-bold text-white">OWNER 2</h4>
                                <span className="text-[10px] font-tech text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-950/40 uppercase">
                                  SUPER_OWNER
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-tech">Phone & SMS OTP Authentication</p>
                            </div>
                          </div>

                          {currentOwnerType === 'owner2' ? (
                            <span className="text-[10px] font-tech uppercase tracking-wider text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              You (Owner 2)
                            </span>
                          ) : (
                            <span className="text-[10px] font-tech uppercase tracking-wider text-slate-400 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60">
                              Co-Equal Owner
                            </span>
                          )}
                        </div>

                        {/* Current Identity Details */}
                        <div className="space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-tech">
                          <div className="flex justify-between items-center py-1 border-b border-slate-900">
                            <span className="text-slate-400 uppercase text-[10px]">Registered Phone:</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              {ownershipData?.owner2.identifier || '+92 305 6674374'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-900">
                            <span className="text-slate-400 uppercase text-[10px]">Coverage & Region:</span>
                            <span className="text-slate-300 flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-cyan-400" />
                              Pakistan (+92)
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-slate-900">
                            <span className="text-slate-400 uppercase text-[10px]">Verification Status:</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Cryptographically Active
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-slate-400 uppercase text-[10px]">Last Login:</span>
                            <span className="text-slate-400">
                              {ownershipData?.owner2.lastLoginAt ? new Date(ownershipData.owner2.lastLoginAt).toLocaleString() : 'Active session'}
                            </span>
                          </div>
                        </div>

                        {/* Individual Management Interface */}
                        {currentOwnerType === 'owner2' ? (
                          <div className="space-y-3 pt-2 border-t border-slate-800">
                            <div>
                              <label className="block text-[10px] font-tech uppercase tracking-wider text-slate-300 mb-1 font-bold">
                                Update Your Registered Phone Identity
                              </label>
                              <div className="relative">
                                <input
                                  type="tel"
                                  required
                                  value={newOwner2Phone}
                                  onChange={(e) => setNewOwner2Phone(e.target.value)}
                                  placeholder="+92 305 6674374"
                                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-400 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                                />
                                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                Enter complete number with country code. Requires SMS OTP verification.
                              </span>
                            </div>

                            {!owner2OtpSent ? (
                              <button
                                type="button"
                                onClick={handleSendOwner2Otp}
                                disabled={ownerUpdating}
                                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-tech text-xs uppercase tracking-wider font-extrabold transition-all flex items-center justify-center gap-2 shadow-md"
                              >
                                {ownerUpdating ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Sending SMS OTP...</span>
                                  </>
                                ) : (
                                  <>
                                    <Phone className="w-4 h-4" />
                                    <span>Send SMS OTP to New Phone</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <form onSubmit={handleConfirmOwner2PhoneUpdate} className="space-y-3 animate-in fade-in duration-150">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="text-[10px] font-tech uppercase tracking-wider text-slate-300 font-bold">
                                      Enter 6-Digit SMS OTP
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => setOwner2OtpSent(false)}
                                      className="text-[10px] text-cyan-400 hover:underline"
                                    >
                                      Change Number
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={owner2OtpCode}
                                    onChange={(e) => setOwner2OtpCode(e.target.value)}
                                    placeholder="123456"
                                    className="w-full bg-slate-900 border border-emerald-500/60 focus:border-emerald-400 rounded-lg px-3 py-2 text-center text-sm font-tech tracking-[0.25em] text-emerald-300 placeholder-slate-600 focus:outline-none"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="submit"
                                    disabled={ownerUpdating}
                                    className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-tech text-xs uppercase tracking-wider font-extrabold transition-all flex items-center justify-center gap-2 shadow-md"
                                  >
                                    {ownerUpdating ? 'Verifying...' : 'Verify & Lock Phone Identity'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleSendOwner2Otp}
                                    disabled={ownerUpdating}
                                    className="px-3 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-tech"
                                  >
                                    Resend
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                            <div className="flex items-center gap-2 text-amber-400 font-tech font-bold text-[11px] uppercase">
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Sovereign Identity Locked to Owner 2</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans">
                              Managed exclusively by Owner 2 via SMS OTP verification. Owner 1 or other accounts are cryptographically prohibited from altering Owner 2's phone identity.
                            </p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* EQUAL SUPER OWNER PERMISSIONS MATRIX */}
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-slate-300 font-tech text-xs font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Equal Sovereignty & Dual Permission Matrix</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-tech">
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-cyan-400 font-bold block mb-1">Product & Vault Catalog</span>
                          <span className="text-slate-400 text-[11px] block">Full create, edit, image upload, and deletion rights for both owners.</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-cyan-400 font-bold block mb-1">Pricing & Inventory</span>
                          <span className="text-slate-400 text-[11px] block">Unrestricted live pricing adjustments and stock control for both owners.</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-cyan-400 font-bold block mb-1">Admin & Team Management</span>
                          <span className="text-slate-400 text-[11px] block">Dispatch invitations, assign Administrator/Owner roles, revoke access.</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-cyan-400 font-bold block mb-1">Customer Orders</span>
                          <span className="text-slate-400 text-[11px] block">Process order tracking, updates, and Pakistan-wide deliveries.</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-cyan-400 font-bold block mb-1">Business Contact Settings</span>
                          <span className="text-slate-400 text-[11px] block">Manage public WhatsApp (+92 305 6674374) and boutique credentials.</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                          <span className="text-cyan-400 font-bold block mb-1">Identity Sovereignty</span>
                          <span className="text-slate-400 text-[11px] block">Each owner strictly manages only their own authentication credentials.</span>
                        </div>
                      </div>
                    </div>

                    {/* IMMUTABLE AUDIT LOG */}
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-300 font-tech text-xs font-bold uppercase tracking-wider">
                          <History className="w-4 h-4 text-cyan-400" />
                          <span>Ownership Identity Audit Log</span>
                        </div>
                        <button
                          onClick={() => fetchOwnershipData()}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-tech uppercase"
                        >
                          Refresh Audit
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-tech">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                              <th className="pb-2">Timestamp</th>
                              <th className="pb-2">Target Owner</th>
                              <th className="pb-2">Action</th>
                              <th className="pb-2">Actor / Verification</th>
                              <th className="pb-2">New Identifier</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900 text-slate-300">
                            {ownershipData?.auditLog && ownershipData.auditLog.length > 0 ? (
                              ownershipData.auditLog.map((log, idx) => (
                                <tr key={log.id || idx} className="hover:bg-slate-900/40">
                                  <td className="py-2.5 text-[11px] text-slate-400">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </td>
                                  <td className="py-2.5 font-bold text-white">
                                    {log.ownerType === 'owner1' ? 'Super Owner 1' : 'Super Owner 2'}
                                  </td>
                                  <td className="py-2.5">
                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-900 border border-slate-800 text-cyan-300">
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-slate-400 text-[11px]">{log.actor}</td>
                                  <td className="py-2.5 font-mono text-[11px] text-amber-300">
                                    {log.newIdentifier || '—'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-4 text-center text-slate-500">
                                  No identity modification entries logged yet. System sovereign state active.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                )
              )}

            </div>
          </>
        )}

      </div>

      {/* ======================================================== */}
      {/* 3. PRODUCT UPLOAD & EDIT MODAL                           */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0d1018] border border-cyan-500/40 rounded-2xl p-6 sm:p-8 space-y-5 my-8 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-cinzel text-lg font-bold text-white">
                  {editingProductId ? 'Edit Product in Vault' : 'Upload & Add Real Product'}
                </h3>
                <p className="text-[11px] font-tech text-cyan-400 uppercase tracking-wider">
                  Product will be permanently saved and displayed immediately on the website
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              
              {/* IMAGE UPLOAD FIELD (DRAG & DROP / BROWSE) */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <label className="block text-[11px] font-tech uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Product Image (Upload File or Enter URL)
                </label>

                {/* Upload File Box */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-xl p-4 text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-6 h-6 text-cyan-400" />
                    <div>
                      <p className="text-xs text-white font-tech font-bold uppercase">
                        {uploadingImage ? 'Uploading...' : 'Browse Image File'}
                      </p>
                      <p className="text-[10px] text-slate-400">JPG, PNG, WEBP, AVIF from device</p>
                    </div>
                  </div>

                  {/* Image Preview Box */}
                  <div className="relative aspect-video rounded-xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
                    {productForm.image ? (
                      <>
                        <img
                          src={productForm.image}
                          alt="Preview"
                          className="w-full h-full object-cover object-center"
                        />
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, image: '' })}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/80 text-red-400 hover:text-white border border-red-500/40"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="text-slate-600 text-xs font-tech flex flex-col items-center gap-1">
                        <ImageIcon className="w-5 h-5 text-slate-700" />
                        <span>No image selected yet</span>
                      </div>
                    )}
                  </div>
                </div>

                {uploadProgress && (
                  <p className="text-[11px] font-tech text-cyan-400 animate-pulse">{uploadProgress}</p>
                )}

                {/* Or paste Image URL */}
                <div>
                  <span className="text-[10px] font-tech uppercase text-slate-400 block mb-1">
                    Or paste direct image web link / URL:
                  </span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.image || ''}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Sovereign Automatic Watch"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white font-tech uppercase"
                  >
                    <option value="Watches">Watches</option>
                    <option value="Wallets">Wallets</option>
                    <option value="Sunglasses">Sunglasses</option>
                    <option value="Perfumes">Perfumes</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Price, Original Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 1800"
                    value={productForm.originalPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                    Vault Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={productForm.stock ?? ''}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Badge & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                    Badge Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Limited Edition, Masterpiece, Bestseller"
                    value={productForm.badge || ''}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-tech">
                    <input
                      type="checkbox"
                      checked={productForm.featured || false}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="accent-cyan-400 w-4 h-4 rounded"
                    />
                    <span>Highlight on Homepage Featured Piece</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                  Product Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the materials, horological movement, leather grade, or scent notes..."
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white leading-relaxed"
                />
              </div>

              {/* Specifications */}
              <div>
                <label className="block text-[10px] font-tech uppercase text-slate-400 mb-1">
                  Technical Specifications (Optional)
                </label>
                
                {productForm.specs && Object.keys(productForm.specs).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(productForm.specs).map(([k, v]) => (
                      <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        <strong className="text-cyan-400 font-tech uppercase">{k}:</strong> {v}
                        <button type="button" onClick={() => handleRemoveSpec(k)} className="text-slate-500 hover:text-red-400 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Spec Name (e.g. Movement, Material)"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Spec Value (e.g. Calibre AV-902, 950 Platinum)"
                    value={specVal}
                    onChange={(e) => setSpecVal(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-tech text-white uppercase"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg border border-slate-700 text-xs font-tech uppercase tracking-wider text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-7 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-500 hover:from-cyan-300 hover:to-blue-400 text-black font-tech text-xs uppercase tracking-wider font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                >
                  {editingProductId ? 'Save Product Changes' : 'Publish Product to Vault'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
