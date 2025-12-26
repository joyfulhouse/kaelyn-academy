"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConsentForm {
  parentName: string;
  parentEmail: string;
  childName: string;
  childBirthdate: string;
  relationship: string;
  agreements: {
    dataCollection: boolean;
    dataUse: boolean;
    communication: boolean;
    termsOfService: boolean;
    privacyPolicy: boolean;
  };
  signature: string;
  signatureDate: string;
}

export default function COPPAConsentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ConsentForm>({
    parentName: "",
    parentEmail: "",
    childName: "",
    childBirthdate: "",
    relationship: "parent",
    agreements: {
      dataCollection: false,
      dataUse: false,
      communication: false,
      termsOfService: false,
      privacyPolicy: false,
    },
    signature: "",
    signatureDate: new Date().toISOString().split("T")[0],
  });

  const allAgreementsAccepted = Object.values(form.agreements).every(Boolean);
  const canProceed = step === 1
    ? form.parentName && form.parentEmail && form.childName && form.childBirthdate && form.relationship
    : step === 2
    ? allAgreementsAccepted
    : form.signature;

  const handleSubmit = async () => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      // TODO: Submit consent to API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/consent/success");
    } catch (error) {
      console.error("Failed to submit consent:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">👨‍👩‍👧</div>
          <h1 className="text-3xl font-bold text-gray-900">Parental Consent</h1>
          <p className="text-gray-600 mt-2">
            COPPA-compliant consent for your child&apos;s account
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  s < step
                    ? "bg-green-500 text-white"
                    : s === step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              <span className={`text-sm ${s === step ? "font-medium" : "text-gray-500"}`}>
                {s === 1 ? "Information" : s === 2 ? "Agreements" : "Signature"}
              </span>
              {s < 3 && <div className="w-12 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Step 1: Information */}
        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Parent & Child Information</CardTitle>
              <CardDescription>
                Please provide accurate information for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                  <Input
                    id="parentName"
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    placeholder="Full legal name"
                  />
                </div>
                <div>
                  <Label htmlFor="parentEmail">Parent Email *</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={form.parentEmail}
                    onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childName">Child&apos;s Name *</Label>
                  <Input
                    id="childName"
                    value={form.childName}
                    onChange={(e) => setForm({ ...form, childName: e.target.value })}
                    placeholder="Child's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="childBirthdate">Child&apos;s Birthdate *</Label>
                  <Input
                    id="childBirthdate"
                    type="date"
                    value={form.childBirthdate}
                    onChange={(e) => setForm({ ...form, childBirthdate: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="relationship">Relationship to Child *</Label>
                <select
                  id="relationship"
                  value={form.relationship}
                  onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="parent">Parent</option>
                  <option value="legal_guardian">Legal Guardian</option>
                  <option value="foster_parent">Foster Parent</option>
                </select>
              </div>

              {token && (
                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  Consent request token: {token.substring(0, 8)}...
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Agreements */}
        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Required Agreements</CardTitle>
              <CardDescription>
                Please review and accept the following to proceed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "dataCollection" as const,
                  title: "Data Collection Consent",
                  description: "I consent to Kaelyn's Academy collecting my child's educational data, including progress, activity, and learning preferences, to provide personalized learning experiences.",
                },
                {
                  key: "dataUse" as const,
                  title: "Data Usage Agreement",
                  description: "I understand that collected data will be used solely for educational purposes, improving the learning experience, and generating progress reports for parents and teachers.",
                },
                {
                  key: "communication" as const,
                  title: "Communication Preferences",
                  description: "I agree to receive educational updates, progress reports, and important account notifications via email.",
                },
                {
                  key: "termsOfService" as const,
                  title: "Terms of Service",
                  description: "I have read and agree to the Terms of Service, including acceptable use policies for my child.",
                },
                {
                  key: "privacyPolicy" as const,
                  title: "Privacy Policy",
                  description: "I have read and understand the Privacy Policy, including how my child's data is collected, stored, and protected.",
                },
              ].map((agreement) => (
                <div
                  key={agreement.key}
                  className={`p-4 rounded-lg border ${
                    form.agreements[agreement.key]
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreements[agreement.key]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          agreements: { ...form.agreements, [agreement.key]: e.target.checked },
                        })
                      }
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{agreement.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{agreement.description}</div>
                    </div>
                  </label>
                </div>
              ))}

              <div className="flex gap-4 text-sm text-blue-600">
                <a href="/terms" target="_blank" className="hover:underline">
                  View Terms of Service
                </a>
                <a href="/privacy" target="_blank" className="hover:underline">
                  View Privacy Policy
                </a>
                <a href="/coppa" target="_blank" className="hover:underline">
                  View COPPA Notice
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Signature */}
        {step === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Electronic Signature</CardTitle>
              <CardDescription>
                By signing below, you confirm your consent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <p className="font-medium text-gray-900 mb-2">Consent Summary:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Parent: {form.parentName}</li>
                  <li>• Child: {form.childName}</li>
                  <li>• Relationship: {form.relationship}</li>
                  <li>• Data collection and usage for educational purposes</li>
                  <li>• Communication via email</li>
                  <li>• Agreement to Terms of Service and Privacy Policy</li>
                </ul>
              </div>

              <div>
                <Label htmlFor="signature">Type Your Full Legal Name as Signature *</Label>
                <Input
                  id="signature"
                  value={form.signature}
                  onChange={(e) => setForm({ ...form, signature: e.target.value })}
                  placeholder="Type your full name"
                  className="font-serif text-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  By typing your name, you are providing an electronic signature
                </p>
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.signatureDate}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Under COPPA regulations, this consent is required for children under 13.
                  You may revoke consent at any time by contacting us at privacy@kaelyns.academy.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canProceed || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? "Submitting..." : step === 3 ? "Submit Consent" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
