"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBatchUploadStudents } from "@/hooks/use-batch-upload";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface BatchUploadFormProps {
  onClose?: () => void;
}

export function BatchUploadForm({ onClose }: BatchUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const batchUpload = useBatchUploadStudents();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error("Only Excel files (.xlsx, .xls) and CSV files are allowed");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      const result = await batchUpload.mutateAsync(selectedFile);
      setUploadResult(result.data);
    } catch (error: any) {
      // Error is handled by the mutation's onError
      if (error?.response?.data?.data?.errors) {
        setUploadResult({ errors: error.response.data.data.errors });
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      {
        "Nama Lengkap": "Ahmad Fadli",
        "Tanggal Lahir": "2010-05-15",
        Alamat: "Jl. Merdeka No. 123",
        "No. Telepon": "081234567890",
        Wali: "Budi Santoso",
        "Jenis Kelamin": "MALE",
        "Tahun Masuk": "2024",
      },
      {
        "Nama Lengkap": "Siti Nurhaliza",
        "Tanggal Lahir": "2011-08-22",
        Alamat: "Jl. Sudirman No. 456",
        "No. Telepon": "081234567891",
        Wali: "Dewi Sartika",
        "Jenis Kelamin": "FEMALE",
        "Tahun Masuk": "2024",
      },
    ];

    // Convert to CSV format for download
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(","),
      ...templateData.map((row) =>
        headers
          .map((header) => `"${row[header as keyof typeof row]}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_siswa.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span className="text-sm font-medium">Template Excel</span>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          Download Template
        </Button>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="file-upload">Pilih File</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="flex-1"
          />
          {selectedFile && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {selectedFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4" />
            <span>{selectedFile.name}</span>
            <Badge variant="secondary">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </Badge>
          </div>
        )}
      </div>

      {/* Format Requirements */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Format yang diperlukan:</strong>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              • <strong>Nama Lengkap</strong> (wajib)
            </li>
            <li>
              • <strong>Jenis Kelamin</strong> (wajib): MALE/FEMALE, L/P, atau
              Laki-laki/Perempuan
            </li>
            <li>
              • <strong>Tahun Masuk</strong> (wajib)
            </li>
            <li>• Tanggal Lahir (opsional): format tanggal yang valid</li>
            <li>• Alamat, No. Telepon, Wali (opsional)</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Upload Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || batchUpload.isPending}
          className="flex-1"
        >
          {batchUpload.isPending ? "Uploading..." : "Upload Siswa"}
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
        )}
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.errors && uploadResult.errors.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              Hasil Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success Summary */}
            {uploadResult.created !== undefined && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadResult.created}
                  </div>
                  <div className="text-sm text-green-700">Berhasil</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {uploadResult.duplicates?.length || 0}
                  </div>
                  <div className="text-sm text-yellow-700">Duplikat</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {uploadResult.errors?.length || 0}
                  </div>
                  <div className="text-sm text-red-700">Error</div>
                </div>
              </div>
            )}

            {/* Duplicates */}
            {uploadResult.duplicates && uploadResult.duplicates.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">
                  Siswa yang sudah ada (duplikat):
                </h4>
                <ScrollArea className="h-20 border rounded p-2">
                  <div className="space-y-1">
                    {uploadResult.duplicates.map(
                      (name: string, index: number) => (
                        <Badge key={index} variant="secondary" className="mr-1">
                          {name}
                        </Badge>
                      )
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Errors */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-destructive">
                  Error yang ditemukan:
                </h4>
                <ScrollArea className="h-40 border rounded">
                  <div className="p-3 space-y-2">
                    {uploadResult.errors.map((error: any, index: number) => (
                      <div
                        key={index}
                        className="text-sm border-l-2 border-red-200 pl-3"
                      >
                        <div className="font-medium">Baris {error.row}</div>
                        <div className="text-muted-foreground">
                          {error.field}: {error.message}
                        </div>
                        {error.value && (
                          <div className="text-xs text-muted-foreground">
                            Nilai: {error.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Success message */}
            {uploadResult.created > 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Berhasil menambahkan {uploadResult.created} siswa baru ke
                  sistem!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
