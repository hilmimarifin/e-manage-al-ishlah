"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useBatchUploadStudents } from "@/hooks/use-batch-upload";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface BatchUploadFormProps {
  onClose?: () => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface UploadResult {
  created?: number;
  duplicates?: string[];
  errors?: ValidationError[];
  totalProcessed?: number;
}

export function BatchUploadForm({ onClose }: BatchUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);
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
      toast.error("Pilih file terlebih dahulu", {
        description: "Anda harus memilih file Excel atau CSV untuk diupload"
      });
      return;
    }

    try {
      const result = await batchUpload.mutateAsync(selectedFile);
      console.log('Upload result:', result); // Debug log
      
      // The API client extracts data from successful responses automatically
      // So result should be the actual upload data
      const data = result as any; // Type assertion to handle the response
      setUploadResult(data);
      
      // Show appropriate toast based on results
      if (data?.created && data.created > 0) {
        toast.success(`Berhasil menambahkan ${data.created} siswa`, {
          description: `${data.duplicates?.length || 0} duplikat dilewati, ${data.errors?.length || 0} error ditemukan`
        });
      } else if (data?.errors && data.errors.length > 0) {
        toast.error("Upload gagal", {
          description: `Ditemukan ${data.errors.length} error dalam file`
        });
      } else if (data?.duplicates && data.duplicates.length > 0) {
        toast.warning("Semua data duplikat", {
          description: `${data.duplicates.length} siswa sudah ada dalam database`
        });
      } else {
        // Fallback for successful upload with no data
        toast.success("Upload berhasil", {
          description: "File berhasil diproses"
        });
      }
      
    } catch (error: any) {
      console.error('Upload error:', error); // Debug log
      
      // Handle validation errors from API
      if (error?.response?.data?.data?.errors) {
        setUploadResult({ errors: error.response.data.data.errors });
        toast.error("Upload gagal - Error validasi", {
          description: `Ditemukan ${error.response.data.data.errors.length} error dalam file`
        });
      } else {
        // Handle other errors
        const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Terjadi kesalahan saat upload';
        toast.error("Upload gagal", {
          description: errorMessage
        });
      }
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setShowErrorDetails(false);
    setShowDuplicateDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const copyErrorsToClipboard = () => {
    if (!uploadResult?.errors) return;
    
    const errorText = uploadResult.errors
      .map(error => `Baris ${error.row}: ${error.field} - ${error.message} (Nilai: ${error.value})`)
      .join('\n');
    
    navigator.clipboard.writeText(errorText).then(() => {
      toast.success("Error list disalin ke clipboard");
    }).catch(() => {
      toast.error("Gagal menyalin ke clipboard");
    });
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      {
        NIK: "123456789012345678",
        "Nama Lengkap": "Ahmad Fadli",
        "Tanggal Lahir": "2010-05-15",
        "Tempat Lahir": "Bandar Lampung",
        Alamat: "Jl. Merdeka No. 123",
        "No. Telepon": "081234567890",
        Wali: "Budi Santoso",
        "Jenis Kelamin": "L",
        "Tahun Masuk": "2024/2025",
      },
      {
        NIK: "123456789012345678",
        "Nama Lengkap": "Siti Nurhaliza",
        "Tanggal Lahir": "2011-08-22",
        "Tempat Lahir": "Bandar Lampung",
        Alamat: "Jl. Sudirman No. 456",
        "No. Telepon": "081234567891",
        Wali: "Dewi Sartika",
        "Jenis Kelamin": "P",
        "Tahun Masuk": "2024/2025",
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
          {batchUpload.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
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
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              {uploadResult.errors && uploadResult.errors.length > 0 ? (
                <AlertCircle className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              Hasil Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success Summary - Responsive Grid */}
            {uploadResult.created !== undefined && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <div className="text-center p-3 md:p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                    {uploadResult.created}
                  </div>
                  <div className="text-xs md:text-sm text-green-700 dark:text-green-300">Berhasil Ditambahkan</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {uploadResult.duplicates?.length || 0}
                  </div>
                  <div className="text-xs md:text-sm text-yellow-700 dark:text-yellow-300">Duplikat Dilewati</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
                    {uploadResult.errors?.length || 0}
                  </div>
                  <div className="text-xs md:text-sm text-red-700 dark:text-red-300">Error Ditemukan</div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadResult.created && uploadResult.created > 0 && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
                  <span className="font-medium">Berhasil!</span> {uploadResult.created} siswa baru telah ditambahkan ke sistem.
                  {uploadResult.totalProcessed && (
                    <span className="block mt-1 text-xs opacity-80">
                      Total diproses: {uploadResult.totalProcessed} baris
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Duplicates Section */}
            {uploadResult.duplicates && uploadResult.duplicates.length > 0 && (
              <div className="space-y-3">
                <Collapsible open={showDuplicateDetails} onOpenChange={setShowDuplicateDetails}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-sm md:text-base">
                          Siswa Duplikat ({uploadResult.duplicates.length})
                        </span>
                      </div>
                      {showDuplicateDetails ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 mt-2">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Siswa berikut sudah ada dalam database dan dilewati:
                    </p>
                    <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                      <div className="flex flex-wrap gap-1">
                        {uploadResult.duplicates.map((name: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {/* Errors Section */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="space-y-3">
                <Collapsible open={showErrorDetails} onOpenChange={setShowErrorDetails}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="font-medium text-sm md:text-base text-destructive">
                          Error Validasi ({uploadResult.errors.length})
                        </span>
                      </div>
                      {showErrorDetails ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 mt-2">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Perbaiki error berikut dan upload ulang file:
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyErrorsToClipboard}
                        className="text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Salin Error
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-48 md:h-64 border rounded-lg">
                      <div className="p-3 space-y-3">
                        {uploadResult.errors.map((error: ValidationError, index: number) => (
                          <div
                            key={index}
                            className="border-l-4 border-red-400 pl-3 py-2 bg-red-50 dark:bg-red-950/30 rounded-r-md"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <Badge variant="destructive" className="text-xs w-fit">
                                Baris {error.row}
                              </Badge>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="font-medium text-sm text-destructive">
                                {error.field}
                              </span>
                            </div>
                            <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                              {error.message}
                            </p>
                            {error.value && (
                              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                                <span className="text-muted-foreground">Nilai: </span>
                                <span className="text-red-600 dark:text-red-400">
                                  &quot;{error.value}&quot;
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <Alert className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-800 dark:text-red-200 text-xs md:text-sm">
                        <span className="font-medium">Penting:</span> Perbaiki semua error di atas dalam file Excel/CSV Anda, 
                        kemudian upload ulang untuk memproses data yang gagal.
                      </AlertDescription>
                    </Alert>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
