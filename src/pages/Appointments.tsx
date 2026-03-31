import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Stethoscope, Loader2, CheckCircle, Trash2 } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  available_slots: string[];
}

interface Appointment {
  id: string;
  doctor_name: string;
  specialization: string;
  appointment_date: string;
  time_slot: string;
  status: string;
}

export default function Appointments() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('doctors').select('*').then(({ data }) => data && setDoctors(data)),
      supabase.from('appointments').select('*').eq('user_id', user.id).order('appointment_date', { ascending: true }).then(({ data }) => data && setAppointments(data)),
    ]).then(() => setLoading(false));
  }, [user]);

  const bookAppointment = async (doctor: Doctor) => {
    const slot = selectedSlots[doctor.id];
    if (!slot || !user) return;
    setBooking(doctor.id);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await supabase.from('appointments').insert({
        user_id: user.id,
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        specialization: doctor.specialization,
        appointment_date: tomorrow.toISOString().split('T')[0],
        time_slot: slot,
        status: 'booked',
      });

      const { data } = await supabase.from('appointments').select('*').eq('user_id', user.id).order('appointment_date', { ascending: true });
      if (data) setAppointments(data);
      setSelectedSlots((prev) => ({ ...prev, [doctor.id]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(null);
    }
  };

  const cancelAppointment = async (id: string) => {
    await supabase.from('appointments').delete().eq('id', id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="app-page page-fade max-w-6xl">
      <section className="app-card-muted p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Appointments</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Appointments</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">Book appointments with available doctors and review your scheduled visits.</p>
      </section>

      <div className="mb-10 mt-8">
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="rounded-xl border border-[#1f5d4f] bg-primary/10 p-2">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          Available Doctors
        </h2>
        {doctors.length === 0 ? (
          <p className="app-card p-8 text-center text-sm text-muted-foreground">No doctors available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {doctors.map((doc) => (
              <div key={doc.id} className="app-card p-5 transition-colors hover:bg-[#232323]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1f5d4f] bg-primary/10">
                    <Stethoscope className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Dr. {doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.specialization}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.available_slots?.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlots((prev) => ({ ...prev, [doc.id]: slot }))}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                        selectedSlots[doc.id] === slot
                          ? 'border-[#1f5d4f] bg-primary/10 text-primary'
                          : 'border-border bg-secondary text-muted-foreground hover:bg-card hover:text-foreground'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <Button
                  variant="default"
                  size="sm"
                  disabled={!selectedSlots[doc.id] || booking === doc.id}
                  onClick={() => bookAppointment(doc)}
                  className="w-full"
                >
                  {booking === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Book Appointment'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-5 flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="rounded-xl border border-[#1f5d4f] bg-primary/10 p-2">
            <CalendarDays className="h-4 w-4 text-success" />
          </div>
          Your Appointments
        </h2>
        {appointments.length === 0 ? (
          <p className="app-card p-8 text-center text-sm text-muted-foreground">No appointments booked yet.</p>
        ) : (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="app-card flex items-center gap-4 p-4 transition-colors hover:bg-[#232323]">
                <div className="rounded-2xl border border-[#1f5d4f] bg-primary/10 p-2.5">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">Dr. {a.doctor_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{a.specialization}</span>
                    <span>|</span>
                    <CalendarDays className="h-3 w-3" /> {new Date(a.appointment_date).toLocaleDateString()}
                    <Clock className="h-3 w-3 ml-1" /> {a.time_slot}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-secondary" onClick={() => cancelAppointment(a.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

