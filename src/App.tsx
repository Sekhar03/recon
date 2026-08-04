import React, { useState } from 'react';
import { UserSession, ModuleKey, Category, SubProduct, FileState, ReconRecord, ReconJob } from './types';
import { CheckCircle2, X } from 'lucide-react';
import { LoginPortal } from './components/LoginPortal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Stepper } from './components/wizard/Stepper';
import { Page1Category } from './components/wizard/Page1Category';
import { Page2SubProduct } from './components/wizard/Page2SubProduct';
import { Page3DateCycle } from './components/wizard/Page3DateCycle';
import { Page4FileCollection } from './components/wizard/Page4FileCollection';
import { Page6Results } from './components/wizard/Page6Results';
import { JobArchives } from './components/JobArchives';
import { INITIAL_JOB_ARCHIVES } from './data/mockArchives';
import { SUB_PRODUCTS } from './data/categoriesAndSubProducts';
import { generateReconDataset } from './utils/mockDataGenerator';

export default function App() {
  // Authentication State
  const [userSession, setUserSession] = useState<UserSession>({
    username: 'admin@iserveu.in',
    role: 'Reconciliation Lead',
    title: 'Finance Admin',
    isLoggedIn: true
  });

  // Sidebar & Module State
  const [activeModule, setActiveModule] = useState<ModuleKey>('product-recon');

  // Wizard State (Steps 1 to 4)
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubProduct, setSelectedSubProduct] = useState<SubProduct | null>(null);
  const [targetDate, setTargetDate] = useState<string>('2026-07-28');
  const [targetCycle, setTargetCycle] = useState<string>('Cycle 1 (00:00 - 08:00 Window)');
  const [collectedFiles, setCollectedFiles] = useState<FileState[]>([]);

  // Generated Dataset State
  const [matchedRecords, setMatchedRecords] = useState<ReconRecord[]>([]);
  const [mismatchedRecords, setMismatchedRecords] = useState<ReconRecord[]>([]);
  const [currentJob, setCurrentJob] = useState<ReconJob | null>(null);

  // Job Archives State
  const [jobArchives, setJobArchives] = useState<ReconJob[]>(INITIAL_JOB_ARCHIVES);

  // Initiation Modal
  const [showInitiationModal, setShowInitiationModal] = useState<boolean>(false);

  // Handle Login
  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setActiveModule('product-recon');
  };

  // Handle Logout
  const handleLogout = () => {
    setUserSession({
      username: '',
      role: '',
      title: '',
      isLoggedIn: false
    });
  };

  // Wizard Navigation Step 1 -> Step 2 or 3 (if single subproduct)
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    const subs = SUB_PRODUCTS.filter((sp) => sp.categoryId === cat.id);
    if (subs.length === 1) {
      setSelectedSubProduct(subs[0]);
      setWizardStep(3);
    } else {
      setSelectedSubProduct(null);
      setWizardStep(2);
    }
  };

  // Wizard Navigation Step 2 -> Step 3
  const handleSelectSubProduct = (sp: SubProduct) => {
    setSelectedSubProduct(sp);
    setWizardStep(3);
  };

  // Wizard Navigation Step 3 -> Step 4
  const handleConfigureDateCycle = (date: string, cycle: string) => {
    setTargetDate(date);
    setTargetCycle(cycle);
    setWizardStep(4);
  };

  // Wizard Navigation Step 4 -> Initiation Modal
  const handleProceedToProcessing = (files: FileState[]) => {
    setCollectedFiles(files);

    // Pre-generate the dataset for this subproduct
    if (selectedSubProduct && selectedCategory) {
      const { matchedRecords, mismatchedRecords, job } = generateReconDataset(
        selectedSubProduct.id,
        selectedSubProduct.name,
        selectedCategory.name,
        targetDate,
        targetCycle,
        200
      );

      setMatchedRecords(matchedRecords);
      setMismatchedRecords(mismatchedRecords);
      setCurrentJob(job);

      // Add completed job directly to archives
      setJobArchives((prev) => {
        if (prev.some((j) => j.id === job.id)) return prev;
        return [job, ...prev];
      });
    }

    setShowInitiationModal(true);
  };

  // Reset Wizard to Step 1 and switch to Product Recon module if called from Report section
  const handleStartNewReconFromReport = () => {
    handleStartNewRecon();
    setActiveModule('product-recon');
  };

  // Reset Wizard to Step 1
  const handleStartNewRecon = () => {
    setSelectedCategory(null);
    setSelectedSubProduct(null);
    setCollectedFiles([]);
    setMatchedRecords([]);
    setMismatchedRecords([]);
    setCurrentJob(null);
    setWizardStep(1);
  };

  // Render Login Portal if not logged in
  if (!userSession.isLoggedIn) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        userSession={userSession}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header activeModule={activeModule} userSession={userSession} onLogout={handleLogout} />

        <main className="p-8 max-w-7xl mx-auto w-full">
          {activeModule === 'product-recon' && (
            <div>
              {/* Stepper Progress Header */}
              <Stepper
                currentStep={wizardStep}
                onStepClick={(step) => {
                  if (step < wizardStep) {
                    if (step === 2) {
                      const subs = selectedCategory ? SUB_PRODUCTS.filter((sp) => sp.categoryId === selectedCategory.id) : [];
                      if (subs.length <= 1) {
                        setWizardStep(1);
                        return;
                      }
                    }
                    setWizardStep(step);
                  }
                }}
              />

              {/* Step 1: Category Selection */}
              {wizardStep === 1 && (
                <Page1Category
                  onSelectCategory={handleSelectCategory}
                  selectedCategory={selectedCategory}
                />
              )}

              {/* Step 2: Sub-Product Selection */}
              {wizardStep === 2 && selectedCategory && (
                <Page2SubProduct
                  category={selectedCategory}
                  onSelectSubProduct={handleSelectSubProduct}
                  onBackToCategory={() => setWizardStep(1)}
                  selectedSubProduct={selectedSubProduct}
                />
              )}

              {/* Step 3: Date & Settlement Cycle */}
              {wizardStep === 3 && selectedSubProduct && (
                <Page3DateCycle
                  subProduct={selectedSubProduct}
                  onProceed={handleConfigureDateCycle}
                  onBackToSubProducts={() => {
                    const subs = selectedCategory ? SUB_PRODUCTS.filter((sp) => sp.categoryId === selectedCategory.id) : [];
                    if (subs.length <= 1) {
                      setWizardStep(1);
                    } else {
                      setWizardStep(2);
                    }
                  }}
                  initialDate={targetDate}
                  initialCycle={targetCycle}
                />
              )}

              {/* Step 4: Dedicated Per-File Collection & Cloud Auto-Fetch */}
              {wizardStep === 4 && selectedSubProduct && (
                <Page4FileCollection
                  subProduct={selectedSubProduct}
                  targetDate={targetDate}
                  targetCycle={targetCycle}
                  onProceedToProcessing={handleProceedToProcessing}
                  onBackToDateCycle={() => setWizardStep(3)}
                />
              )}
            </div>
          )}

          {activeModule === 'job-archives' && (
            <JobArchives jobs={jobArchives} onStartNewRecon={handleStartNewReconFromReport} />
          )}
        </main>
      </div>

      {/* Reconciliation Initiated Modal */}
      {showInitiationModal && selectedSubProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 relative text-center space-y-6">
            <button
              onClick={() => {
                setShowInitiationModal(false);
                handleStartNewRecon();
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/15 text-[#10b981] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#10b981]/15 text-[#10b981] px-3 py-1 rounded-full border border-[#10b981]/30">
                Reconciliation Initiated
              </span>
              <h3 className="text-xl font-bold text-[#1b2a3e] mt-2">
                Reconciliation Initiated Successfully!
              </h3>
              <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                Reconciliation process for <span className="font-semibold text-[#1b2a3e]">{selectedSubProduct.name}</span> ({targetDate} — {targetCycle}) has been initiated. Completed results are available in the <span className="font-semibold text-[#119db0]">Report</span> section.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowInitiationModal(false);
                  handleStartNewRecon();
                }}
                className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#0d9668] text-white font-bold text-xs shadow-lg shadow-[#10b981]/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start New Reconciliation</span>
              </button>
              <button
                onClick={() => {
                  setShowInitiationModal(false);
                  handleStartNewRecon();
                  setActiveModule('job-archives');
                }}
                className="w-full py-3 rounded-xl bg-[#1b2a3e] hover:bg-[#253650] text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View in Report Section</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
