import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import PersonalInfoForm from '../../components/profile/PersonalInfoForm';
import CustomerAddressSection from '../../components/profile/CustomerAddressSection';

export default function ProfilePage() {
  const { user } = useAuth();
  const isCustomer = user?.role === ROLES.CUSTOMER;

  return (
    <div className="space-y-6 pb-20 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-muted-text mt-1">
          Manage your account information and preferences.
        </p>
      </div>

      {/* 1. Personal Information Form (All Roles) */}
      <PersonalInfoForm />

      {/* 2. Saved Addresses Section (Customers Only) */}
      {isCustomer && <CustomerAddressSection />}
    </div>
  );
}
