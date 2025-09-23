"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useUpdatePayment } from '@/hooks/use-payment-class';
import { PaymentClass } from '@/types';

type Props = {
  selectedPayment?: PaymentClass | null;
  onClose?: () => void;
}

const PaymentForm = ({ selectedPayment, onClose }: Props) => {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const updatePayment = useUpdatePayment();

  const months = useMemo(() => [
    { key: "jul", name: "Juli", number: 7 },
    { key: "aug", name: "Agustus", number: 8 },
    { key: "sep", name: "September", number: 9 },
    { key: "oct", name: "Oktober", number: 10 },
    { key: "nov", name: "November", number: 11 },
    { key: "dec", name: "Desember", number: 12 },
    { key: "jan", name: "Januari", number: 1 },
    { key: "feb", name: "Februari", number: 2 },
    { key: "mar", name: "Maret", number: 3 },
    { key: "apr", name: "April", number: 4 },
    { key: "may", name: "Mei", number: 5 },
    { key: "jun", name: "Juni", number: 6 },
  ], []);

  // Initialize selected months based on current payment status
  useEffect(() => {
    if (selectedPayment) {
      const unpaidMonths: string[] = [];
      months.forEach((month) => {
        const isPaid = selectedPayment.monthlyFee[month.key as keyof typeof selectedPayment.monthlyFee];
        if (!isPaid) {
          unpaidMonths.push(month.number.toString());
        }
      });
      setSelectedMonths(unpaidMonths);
    }
  }, [selectedPayment, months]);

  const handleMonthToggle = (monthNumber: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthNumber) 
        ? prev.filter(m => m !== monthNumber)
        : [...prev, monthNumber]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPayment || selectedMonths.length === 0) {
      return;
    }

    try {
      await updatePayment.mutateAsync({
        studentId: selectedPayment.id,
        classId: selectedPayment.classId,
        months: selectedMonths
      });
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to update payment:', error);
    }
  };

  if (!selectedPayment) {
    return (
      <div className="text-center py-4">
        <p>Pilih siswa untuk mengupdate pembayaran</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Informasi Siswa</h3>
          <p className="text-sm text-gray-600">Nama: {selectedPayment.name}</p>
          <p className="text-sm text-gray-600">Kelas: {selectedPayment.className}</p>
          <p className="text-sm text-gray-600">Tahun Ajaran: {selectedPayment.year}</p>
        </div>

        <div>
          <Label className="text-base font-medium">Pilih Bulan yang Akan Dibayar:</Label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            {months.map((month) => {
              const isPaid = selectedPayment.monthlyFee[month.key as keyof typeof selectedPayment.monthlyFee];
              const isSelected = selectedMonths.includes(month.number.toString());
              
              return (
                <div key={month.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={month.key}
                    checked={isSelected}
                    disabled={isPaid > 0} // Disable if already paid
                    onCheckedChange={() => handleMonthToggle(month.number.toString())}
                  />
                  <Label 
                    htmlFor={month.key} 
                    className={`text-sm ${isPaid > 0 ? 'text-green-600 font-medium' : ''}`}
                  >
                    {month.name} {isPaid > 0 && '✓'}
                  </Label>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ✓ = Sudah dibayar, bulan yang sudah dibayar tidak dapat diubah
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={selectedMonths.length === 0 || updatePayment.isPending}
        >
          {updatePayment.isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;