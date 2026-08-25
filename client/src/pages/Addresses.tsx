/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import type { Address } from '../types';
import { MapIcon, PlugIcon } from 'lucide-react';
import Loading from '../components/Loading';
import AddressCard from '../components/AddressCard';
import AddressForm from '../components/AddressForm';
import { useAuth } from '../context/authContext';
import api from '../config/api';
import toast from 'react-hot-toast';

const Addresses = () => {
  const { updateUser } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  // ✅ Impostato a true di default per evitare flash o letture premature
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false,
  });

  const resetForm = () => {
    setForm({
      label: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      isDefault: false,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const getLocation = (retries = 3): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      const attempt = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error: any) => {
            if (retries > 0) {
              retries--;
              setTimeout(attempt, 1000);
            } else {
              reject(
                new Error(
                  error.message || 'Failed to get location after retries',
                ),
              );
            }
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
        );
      };
      attempt();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const coords = await getLocation();
      const payload = { ...form, ...coords };

      if (editingId) {
        const { data } = await api.put(`/addresses/${editingId}`, payload);
        // Fallback ad array vuoto se data.addresses è undefined
        const updatedList = data?.addresses || [];
        setAddresses(updatedList);
        updateUser({ addresses: updatedList });
        toast.success('Indirizzo aggiornato');
      } else {
        const { data } = await api.post(`/addresses`, payload);
        //  Corretto il bug: usato data.addresses invece di data.setAddresses
        const updatedList = data?.addresses || [];
        setAddresses(updatedList);
        updateUser({ addresses: updatedList });
        toast.success('Indirizzo aggiunto');
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const getAddressId = (add: Address): string | null => {
    const maybeId = (add as any).id ?? add.id;
    return typeof maybeId === 'string' ? maybeId : null;
  };

  const onEditHandler = (add: Address) => {
    setForm({
      label: add.label,
      address: add.address,
      city: add.city,
      state: add.state,
      zip: add.zip,
      isDefault: add.isDefault,
    });
    setEditingId(getAddressId(add));
    setShowForm(true);
  };

  useEffect(() => {
    api
      .get('/addresses')
      .then(({ data }) => {
        // ✅ Fallback || [] per evitare che lo stato diventi undefined
        setAddresses(data?.addresses || data || []);
      })
      .catch((error: any) => {
        toast.error(error.response?.data?.message || error?.message);
        setAddresses([]); // In caso di errore resetta a un array vuoto
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-app-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* page header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-app-green">
            I miei indirizzi
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl 
        hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <PlugIcon className="size-4" /> Aggiungi l'indirizzo
          </button>
        </div>

        {/* form model */}
        {showForm && (
          <AddressForm
            resetForm={resetForm}
            handleSubmit={handleSubmit}
            form={form}
            setForm={setForm}
            editingId={editingId}
          />
        )}

        {/* Addresses list */}
        {loading ? (
          <Loading />
        ) : (addresses?.length ?? 0) === 0 ? (
          <div className="text-center py-16">
            <MapIcon className="size-16 text-app-border mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-green-600">
              Nessun indirizzo trovato
            </h2>
            <p className="text-sm text-app-text-light">
              Aggiungi un indirizzo per un veloce checkout
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {addresses.map((addr) => (
              <AddressCard
                key={getAddressId(addr) || addr.id}
                addr={addr}
                onEditHandler={onEditHandler}
                setAddresses={setAddresses}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addresses;
