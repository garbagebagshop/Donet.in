import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateDriverProfile } from "@/hooks/use-drivers";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Camera, Upload, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DriverOnboarding() {
  const { user } = useAuth();
  const updateProfile = useUpdateDriverProfile();
  const { position, getCurrentPosition } = useGeolocation();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    vehicleType: "",
    hourlyRate: "",
    perKmRate: "",
    citySector: "",
    licenseUrl: "",
    aadhaarUrl: "",
    selfieUrl: "",
  });

  const [uploading, setUploading] = useState(false);

  // Redirect if not a driver or already onboarded
  if (!user || user.role !== "driver") {
    setLocation("/");
    return null;
  }

  if (user.driverProfile?.isVerified) {
    setLocation("/driver-dashboard");
    return null;
  }

  const handleFileUpload = async (file: File, type: 'license' | 'aadhaar' | 'selfie') => {
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();

      setFormData(prev => ({
        ...prev,
        [`${type}Url`]: url
      }));

      toast({ title: "Success", description: `${type} uploaded successfully` });
    } catch (error) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate vehicle details
      if (!formData.vehicleType || !formData.hourlyRate || !formData.perKmRate || !formData.citySector) {
        toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
        return;
      }
    } else if (step === 2) {
      // Validate documents
      if (!formData.licenseUrl || !formData.aadhaarUrl) {
        toast({ title: "Error", description: "Please upload all documents", variant: "destructive" });
        return;
      }
    } else if (step === 3) {
      // Validate selfie
      if (!formData.selfieUrl) {
        toast({ title: "Error", description: "Please capture selfie", variant: "destructive" });
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Final submission
      await getCurrentPosition();
      const driverData = {
        vehicleType: formData.vehicleType,
        hourlyRate: parseInt(formData.hourlyRate),
        perKmRate: parseInt(formData.perKmRate),
        citySector: formData.citySector,
        licenseUrl: formData.licenseUrl,
        aadhaarUrl: formData.aadhaarUrl,
        currentLat: position?.latitude.toString(),
        currentLng: position?.longitude.toString(),
      };

      updateProfile.mutate({
        id: user.driverProfile!.id,
        data: driverData
      }, {
        onSuccess: () => {
          toast({ title: "Success", description: "Profile submitted for verification" });
          setLocation("/driver-dashboard");
        }
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Vehicle Details</h3>
              <p className="text-sm text-muted-foreground">Tell us about your vehicle and rates</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Vehicle Type</Label>
                <Select value={formData.vehicleType} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="auto">Auto Rickshaw</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hourly Rate (₹)</Label>
                  <Input
                    type="number"
                    placeholder="150"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Per Km Rate (₹)</Label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={formData.perKmRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, perKmRate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>City Sector</Label>
                <Input
                  placeholder="e.g., Indiranagar, Koramangala"
                  value={formData.citySector}
                  onChange={(e) => setFormData(prev => ({ ...prev, citySector: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Document Verification</h3>
              <p className="text-sm text-muted-foreground">Upload your driving license and Aadhaar card</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Driving License</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.licenseUrl ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>License uploaded</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'license')}
                        className="hidden"
                        id="license-upload"
                      />
                      <label htmlFor="license-upload" className="cursor-pointer text-sm text-primary">
                        Click to upload license
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Aadhaar Card</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {formData.aadhaarUrl ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Aadhaar uploaded</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'aadhaar')}
                        className="hidden"
                        id="aadhaar-upload"
                      />
                      <label htmlFor="aadhaar-upload" className="cursor-pointer text-sm text-primary">
                        Click to upload Aadhaar
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Selfie Verification</h3>
              <p className="text-sm text-muted-foreground">Take a clear selfie for identity verification</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {formData.selfieUrl ? (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Selfie captured</span>
                </div>
              ) : (
                <div>
                  <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                    className="hidden"
                    id="selfie-upload"
                  />
                  <label htmlFor="selfie-upload" className="cursor-pointer text-sm text-primary">
                    Click to capture selfie
                  </label>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review & Submit</h3>
              <p className="text-sm text-muted-foreground">Please review your information before submitting</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Vehicle Details</h4>
                <p className="text-sm text-gray-600">Type: {formData.vehicleType}</p>
                <p className="text-sm text-gray-600">Rates: ₹{formData.hourlyRate}/hr, ₹{formData.perKmRate}/km</p>
                <p className="text-sm text-gray-600">Area: {formData.citySector}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Documents</h4>
                <p className="text-sm text-gray-600">License: {formData.licenseUrl ? 'Uploaded' : 'Missing'}</p>
                <p className="text-sm text-gray-600">Aadhaar: {formData.aadhaarUrl ? 'Uploaded' : 'Missing'}</p>
                <p className="text-sm text-gray-600">Selfie: {formData.selfieUrl ? 'Captured' : 'Missing'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-2">Driver Onboarding</h1>
        <Progress value={(step / 4) * 100} className="w-full" />
        <p className="text-center text-sm text-muted-foreground mt-2">Step {step} of 4</p>
      </div>

      <Card>
        <CardContent className="p-6">
          {renderStep()}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1"
              disabled={updateProfile.isPending || uploading}
            >
              {updateProfile.isPending || uploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : step === 4 ? (
                "Submit for Verification"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}