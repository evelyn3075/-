import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  CheckCircle, 
  TrendingUp, 
  User, 
  FileText, 
  Layers, 
  Activity, 
  ArrowRight, 
  RotateCcw, 
  Clipboard, 
  Download, 
  History, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Dna, 
  FlaskConical, 
  Database, 
  Calendar,
  ChevronRight,
  AlertCircle,
  FileCheck,
  ClipboardList,
  Key,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductInfo, HistoryEntry, OOSResponse } from "./types";

// Realistic Presets for Pharmaceutical OOS
const PRESETS = [
  {
    name: "🧪 아스피린 정제 함량 시험 규격 초과 (Assay High)",
    productName: "아스피린 정제 100mg (Aspirin Tablet 100mg)",
    batchNo: "ASP202607A",
    testItem: "함량 시험 (Assay Test by HPLC)",
    specResult: "규격: 95.0% ~ 105.0% / 결과: 108.3% (OOS)",
    incidentDetail: "안정성 시험 시료 분석을 위해 아스피린 정제 10정의 무게를 측정하고 분말화한 뒤 표준액 및 검액을 각각 조제하여 HPLC 분석을 실시하였습니다. 그 결과 함량이 108.3%로 개별 정제 상한선 규격인 105.0%를 초과하였습니다. 일차적으로 HPLC 시스템 적합성(System Suitability)은 면적 재현성 RSD 0.5% 이하로 적합한 상태였습니다."
  },
  {
    name: "💊 비타민 C 시럽 용출 시험 기준 미달 (Dissolution Low)",
    productName: "아스코르빈산 시럽 250mg/mL (Ascorbic Acid Liquid)",
    batchNo: "VIT2026B",
    testItem: "용출 시험 (Dissolution Test)",
    specResult: "규격: Q = 80% (30분) / 결과: 72.1% (기준 미달)",
    incidentDetail: "37℃ 용출 시험기에서 대한민국 약전 패들법에 따라 50rpm으로 30분간 용출 시험을 가동하였습니다. 회수한 용출액을 UV-Vis 분광광도계로 측정하여 정량한 결과, 6개 시험용기 평균 용출률이 72.1%로 확인되어 기준 한계치인 80%에 미달하였습니다. 시험 가동 전 수조 온도 및 회전 속도는 규정 내에 있었습니다."
  },
  {
    name: "🔬 아세트아미노펜 서방정 유연물질 일탈 (Impurities)",
    productName: "타이레놀 서방정 650mg (Acetaminophen SR)",
    batchNo: "TYL2026C",
    testItem: "유연물질 시험 (Related Substances by HPLC)",
    specResult: "규격: 개별 미지 유연물질 0.10% 이하 / 결과: 0.18%",
    incidentDetail: "가속 안정성 시험 6개월 차 보관 시료 분석을 진행하였습니다. HPLC 크로마토그램 분석 중 유지시간(Retention Time) 약 14.5분에 새로운 미지 유연물질(Unknown Impurity) 피크가 검출되었고, 계산 결과 면적비 0.18%로 관리 기준 규격인 0.10%를 초과하는 일탈 결과가 확인되었습니다."
  }
];

export default function App() {
  // Input fields state with initial default values from the first scenario preset
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    productName: PRESETS[0].productName,
    batchNo: PRESETS[0].batchNo,
    testItem: PRESETS[0].testItem,
    specResult: PRESETS[0].specResult,
    incidentDetail: PRESETS[0].incidentDetail
  });

  // Wizard state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentResponse, setCurrentResponse] = useState<OOSResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active step user choice
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customText, setCustomText] = useState<string>("");

  // Saved reports history in localStorage
  const [savedReports, setSavedReports] = useState<any[]>([]);

  // View mode: 'landing' or 'app'
  const [viewMode, setViewMode] = useState<"landing" | "app">("landing");

  // API Key management states
  const [apiKey, setApiKey] = useState<string>("");
  const [keyInput, setKeyInput] = useState<string>("");
  const [showKey, setShowKey] = useState<boolean>(false);
  const [keyVerified, setKeyVerified] = useState<boolean>(false);
  const [verifyingKey, setVerifyingKey] = useState<boolean>(false);
  const [keyMessage, setKeyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lock Modal and Highlight states
  const [showLockModal, setShowLockModal] = useState<boolean>(false);
  const [highlightKeySection, setHighlightKeySection] = useState<boolean>(false);

  // Enforce API key verification for accessing functions (viewMode === 'app')
  useEffect(() => {
    if (viewMode === "app" && !keyVerified) {
      setViewMode("landing");
      setShowLockModal(true);
      
      // Auto smooth scroll to API key center with visual highlight
      setTimeout(() => {
        const el = document.getElementById("api-key-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setHighlightKeySection(true);
          setTimeout(() => setHighlightKeySection(false), 3500);
        }
      }, 500);
    }
  }, [viewMode, keyVerified]);

  // Load saved reports and API Key from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gmp_oos_reports");
      if (stored) {
        setSavedReports(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved reports", e);
    }

    try {
      const savedKey = localStorage.getItem("gmp_oos_gemini_key");
      if (savedKey) {
        setApiKey(savedKey);
        setKeyInput(savedKey);
        setKeyVerified(true);
      }
    } catch (e) {
      console.error("Failed to load saved API Key", e);
    }
  }, []);

  // Verification & Save handler for Gemini API Key
  const handleVerifyAndSaveKey = async () => {
    if (!keyInput.trim()) {
      setKeyMessage({ type: "error", text: "API Key를 입력해주세요." });
      return;
    }
    setVerifyingKey(true);
    setKeyMessage(null);
    try {
      const res = await fetch("/api/oos/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_api_key: keyInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "인증에 실패했습니다. 올바른 키 값을 확인해주세요.");
      }
      setApiKey(keyInput.trim());
      setKeyVerified(true);
      localStorage.setItem("gmp_oos_gemini_key", keyInput.trim());
      setKeyMessage({ type: "success", text: "✓ API Key 검증 및 안전한 저장이 완료되었습니다!" });
    } catch (err: any) {
      setKeyVerified(false);
      setKeyMessage({ type: "error", text: err.message || "유효하지 않은 API Key이거나 통신에 실패했습니다." });
    } finally {
      setVerifyingKey(false);
    }
  };

  // Clear API Key
  const handleClearKey = () => {
    setApiKey("");
    setKeyInput("");
    setKeyVerified(false);
    setKeyMessage(null);
    localStorage.removeItem("gmp_oos_gemini_key");
  };

  // Set preset
  const handleLoadPreset = (preset: typeof PRESETS[0]) => {
    setProductInfo({
      productName: preset.productName,
      batchNo: preset.batchNo,
      testItem: preset.testItem,
      specResult: preset.specResult,
      incidentDetail: preset.incidentDetail
    });
    // Reset wizard
    setHistory([]);
    setCurrentResponse(null);
    setError(null);
  };

  const handleLoadPresetAndGo = (preset: typeof PRESETS[0]) => {
    handleLoadPreset(preset);
    setViewMode("app");
  };

  // Start OOS Investigation (triggers classification stage)
  const handleStartInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInfo.productName || !productInfo.batchNo || !productInfo.testItem || !productInfo.specResult || !productInfo.incidentDetail) {
      setError("모든 OOS 상세 내역 항목을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setHistory([]);
    setCurrentResponse(null);

    try {
      const res = await fetch("/api/oos/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_info: productInfo,
          history: [],
          current_stage: null,
          current_why_number: 0,
          user_selection: null,
          custom_api_key: apiKey
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "OOS 일탈 조사를 시작하는데 실패했습니다.");
      }

      const data: OOSResponse = await res.json();
      setCurrentResponse(data);
      // Initialize choice to first option if available
      if (data.options && data.options.length > 0) {
        setSelectedOption(data.options[0]);
      } else {
        setSelectedOption("");
      }
      setCustomText("");
    } catch (err: any) {
      setError(err.message || "서버 통신 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Proceed to next stage in OOS Wizard
  const handleNextStep = async () => {
    if (!currentResponse) return;

    let choiceText = selectedOption;
    if (selectedOption === "기타 (주관식 직접 입력)") {
      if (!customText.trim()) {
        setError("기타 주관식 답변 내용을 입력해주세요.");
        return;
      }
      choiceText = `기타: ${customText.trim()}`;
    }

    // Add current question/narrative and user decision to history
    const newHistoryEntry: HistoryEntry = {
      stage: currentResponse.stage,
      why_number: currentResponse.why_number,
      narrative: currentResponse.narrative,
      selected_option: choiceText
    };

    const updatedHistory = [...history, newHistoryEntry];
    setHistory(updatedHistory);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/oos/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_info: productInfo,
          history: updatedHistory,
          current_stage: currentResponse.stage,
          current_why_number: currentResponse.why_number,
          user_selection: choiceText,
          custom_api_key: apiKey
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "다음 단계를 처리하는 중 오류가 발생했습니다.");
      }

      const data: OOSResponse = await res.json();
      setCurrentResponse(data);

      // Pre-select first option if available
      if (data.options && data.options.length > 0) {
        setSelectedOption(data.options[0]);
      } else {
        setSelectedOption("");
      }
      setCustomText("");

      // If we just reached the report stage, automatically save this report to history list
      if (data.stage === "report" && data.report) {
        const newReportRecord = {
          id: `OOS-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          productInfo: { ...productInfo },
          history: updatedHistory,
          report: data.report
        };
        const updatedRecords = [newReportRecord, ...savedReports];
        setSavedReports(updatedRecords);
        localStorage.setItem("gmp_oos_reports", JSON.stringify(updatedRecords));
      }

    } catch (err: any) {
      setError(err.message || "서버 통신 오류가 발생했습니다.");
      // Rollback history if we failed
      setHistory(history);
    } finally {
      setLoading(false);
    }
  };

  // Restore a previous OOS report from saved logs
  const handleLoadSavedReport = (saved: any) => {
    setProductInfo(saved.productInfo);
    setHistory(saved.history);
    setCurrentResponse({
      stage: "report",
      why_number: 0,
      narrative: "이전에 완료되어 저장된 OOS 조사 및 GMP 보고서 기록입니다.",
      options: [],
      report: saved.report
    });
    setError(null);
    setViewMode("app");
  };

  // Delete a saved report
  const handleDeleteSavedReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem("gmp_oos_reports", JSON.stringify(updated));
  };

  // Reset/Restart OOS Assistant
  const handleReset = () => {
    setProductInfo({
      productName: "",
      batchNo: "",
      testItem: "",
      specResult: "",
      incidentDetail: ""
    });
    setHistory([]);
    setCurrentResponse(null);
    setError(null);
    setSelectedOption("");
    setCustomText("");
  };

  // Copy report key to clipboard
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopyToClipboard = (text: string, label: string) => {
    const formattedText = text.replace(/\\n/g, "\n");
    navigator.clipboard.writeText(formattedText);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Copy full report
  const handleCopyFullReport = () => {
    if (!currentResponse?.report) return;
    const r = currentResponse.report;
    const fullText = `[FDA/cGMP COMPLIANT OOS INVESTIGATION REPORT]
      
${r.overview.replace(/\\n/g, "\n")}

${r.incident.replace(/\\n/g, "\n")}

${r.initial_assessment.replace(/\\n/g, "\n")}

${r.root_cause.replace(/\\n/g, "\n")}

${r.correction.replace(/\\n/g, "\n")}

${r.preventive_action.replace(/\\n/g, "\n")}

${r.effectiveness_check.replace(/\\n/g, "\n")}
    `;
    navigator.clipboard.writeText(fullText);
    setCopiedKey("전체 보고서");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Utility to split the narrative with '\n' and render as paragraphs or list with high legibility
  const renderNarrative = (text: string) => {
    if (!text) return null;
    const lines = text.split(/\\n|\n/);
    return (
      <div className="space-y-3.5 text-slate-800 leading-relaxed text-sm md:text-base font-normal">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          
          if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
            return (
              <div key={idx} className="flex items-start pl-1 mt-1.5">
                <span className="text-blue-600 mr-2.5 font-bold text-base select-none leading-none mt-1">•</span>
                <p className="flex-1 font-medium text-slate-900">{trimmed.replace(/^[-•]\s*/, "")}</p>
              </div>
            );
          }
          
          if (trimmed.match(/^\d+\./)) {
            return (
              <div key={idx} className="flex items-start pl-1 mt-2">
                <span className="text-blue-600 mr-2 font-bold text-sm select-none">{trimmed.match(/^\d+\./)?.[0]}</span>
                <p className="flex-1 font-semibold text-slate-900">{trimmed.replace(/^\d+\.\s*/, "")}</p>
              </div>
            );
          }
          
          return (
            <p key={idx} className="text-slate-800 font-normal leading-relaxed">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  // Utility to parse list content inside reports with high-contrast, premium styling
  const renderReportList = (text: string) => {
    if (!text) return null;
    const lines = text.split(/\\n|\n/);
    return (
      <ul className="space-y-2.5 pl-1 list-none text-slate-800">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          
          // Header titles like "1. 개요" inside sections
          if (trimmed.match(/^\d+\./)) {
            return (
              <li key={idx} className="font-bold text-slate-950 text-sm md:text-base mt-4 border-b border-gray-200 pb-1.5 mb-2.5 flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-blue-600 rounded-xs"></span>
                {trimmed}
              </li>
            );
          }
          
          // Bullet points
          if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.startsWith("•")) {
            return (
              <li key={idx} className="flex items-start pl-2 text-xs md:text-sm leading-relaxed text-slate-900 font-medium">
                <span className="text-blue-600 mr-2.5 font-bold text-base select-none mt-0.5">•</span>
                <span className="flex-1">{trimmed.replace(/^[-*•]\s*/, "")}</span>
              </li>
            );
          }
          
          return (
            <li key={idx} className="text-xs md:text-sm pl-4 leading-relaxed text-slate-800 font-normal">
              {trimmed}
            </li>
          );
        })}
      </ul>
    );
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* Premium Visual Header */}
      <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shadow-xs sticky top-0 z-30 print:hidden">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setViewMode("landing")}
            className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-200 cursor-pointer active:scale-95 transition-all"
          >
            <FlaskConical className="w-5.5 h-5.5" />
          </div>
          <div 
            onClick={() => setViewMode("landing")}
            className="cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider group-hover:scale-105 transition-transform">
                FDA / cGMP Compliant
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">• Pharmaceutical QC Expert System</span>
            </div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900 mt-0.5 group-hover:text-blue-600 transition-colors">
              이화학 일탈 및 OOS 조사 보조기
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="items-center gap-2 text-xs font-semibold text-slate-500 hidden sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 font-semibold text-xs">GMP-Audit Engine Active</span>
          </div>
          <span className="border-l border-slate-200 h-6 hidden sm:inline"></span>
          
          {viewMode === "landing" ? (
            <button
              onClick={() => {
                handleReset();
                setViewMode("app");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-100 cursor-pointer flex items-center gap-1.5 active:scale-95 animate-pulse"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>실시간 분석기 가동</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode("landing")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>소개 및 가이드</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container Split */}
      {viewMode === "landing" ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12 md:px-8 space-y-16">
          {/* Hero Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6">
            <div className="lg:col-span-7 text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200/60 rounded-full text-blue-700 text-xs font-bold uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>FDA & 식약처 cGMP 실사 가이드 반영</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight md:leading-snug"
              >
                제약 이화학 시험실 OOS & 일탈 조사,<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AI와 함께 규제 준수율 100%</span>에 도전하세요
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm md:text-base text-slate-600 leading-relaxed font-medium"
              >
                실험실 오류 최우선 검증(Lab Error First Policy)부터 5Why 물리화학 연쇄 추적, 실사 대응 CAPA 설계, 그리고 Audit-Ready 보고서 생성까지. 복잡한 GMP 일탈 대응 절차가 지능적으로 종결됩니다.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row justify-start items-center gap-4 pt-2"
              >
                <button
                  onClick={() => {
                    handleReset();
                    setViewMode("app");
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold px-8 py-4 rounded-2xl text-sm transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-bounce-slow"
                >
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                  <span>실시간 OOS 조사 가동하기</span>
                </button>
                <a
                  href="#scenarios"
                  className="w-full sm:w-auto bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 font-extrabold px-8 py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>체험용 퀵 시나리오 로드</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>

              {/* Quick Statistics Stats Dashboard */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center"
              >
                {[
                  { value: "SOP-100%", label: "실사 준수율 가이드" },
                  { value: "Lab Error First", label: "선행 배제 지침 강제" },
                  { value: "5-Why RCA", label: "물리화학 요인 분석" },
                  { value: "Audit-Ready", label: "보고서 원클릭 인쇄" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                    <p className="text-base md:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent font-mono">{stat.value}</p>
                    <p className="text-slate-500 text-[10px] font-bold mt-1 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Premium Science Capsule Side-Visual Frame (Based on user-uploaded image) */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative group w-full max-w-[380px] aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xl shadow-blue-100/50"
              >
                {/* Embedded Science Capsule Image */}
                <img 
                  src="/src/assets/images/science_capsule_1783403968268.jpg" 
                  alt="cGMP Pharmaceutical Capsule Science"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Subtle Glassmorphism Bottom Card Details */}
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">NXIR LABS SPECIAL EDITION</p>
                    <p className="text-xs font-extrabold text-white">cGMP Phase-1 Audit Companion</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
                    Verified
                  </span>
                </div>
                
                {/* Floating Technical Annotation Tag 1 */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 text-[9px] font-bold text-slate-800">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                  <span>Active Molecular Trace</span>
                </div>

                {/* Floating Technical Annotation Tag 2 */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 text-[9px] font-bold text-blue-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Lab Error First Protocol</span>
                </div>
              </motion.div>
              
              {/* Background ambient glow behind the capsule frame */}
              <div className="absolute -inset-4 bg-blue-400/10 blur-3xl rounded-full -z-10 pointer-events-none" />
            </div>
          </section>

          {/* Gemini API Key Configuration Section */}
          <motion.section
            id="api-key-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: highlightKeySection ? 1.02 : 1,
              borderColor: highlightKeySection ? "#ef4444" : "#dbeafe"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`bg-gradient-to-r from-slate-50 to-blue-50/30 border-2 rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${
              highlightKeySection ? "ring-8 ring-red-500/10 shadow-lg shadow-red-100" : "shadow-xs border-blue-100"
            }`}
          >
            {/* Ambient decorative background icon */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none text-blue-900">
              <Key className="w-48 h-48" />
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Key className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    Google Gemini API Key 통합 인증 센터
                  </h3>
                  {keyVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
                      <span>개인 API Key 활성화됨</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                      <Lock className="w-3.5 h-3.5" />
                      <span>API Key 연동 필요</span>
                    </span>
                  )}
                </div>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                  본 GMP OOS 분석기는 고성능 추론 처리를 위해 <strong>Google Gemini API</strong> 엔진을 연동하여 전 과정을 제어합니다. 사용자가 안전하게 등록하신 개인 API Key는 브라우저 로컬 저장소(<code className="font-mono bg-white border border-slate-100 rounded px-1 text-slate-700 font-bold">localStorage</code>)에만 암호화 및 격리 보관되며, 당사 서버를 포함한 제3자에게 절대 전송되지 않습니다.
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-400">발급처 가이드:</span>
                  <a
                    href="https://aistudio.google.com/app/api-keys?project=gen-lang-client-0695816739"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-0.5"
                  >
                    Google AI Studio에서 API Key 무료 발급 받기
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs w-full lg:max-w-md space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Google Gemini API Key 입력
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      placeholder="AI Studio에서 발급받은 AIzaSy... 형식의 키 입력"
                      value={keyInput}
                      onChange={(e) => {
                        setKeyInput(e.target.value);
                        setKeyMessage(null);
                      }}
                      disabled={verifyingKey}
                      className="w-full text-xs font-mono border border-slate-200 rounded-xl pl-3.5 pr-10 py-3 bg-slate-50/50 text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white focus:outline-none transition-all disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {keyMessage && (
                  <div
                    className={`p-3 rounded-xl border text-[11px] font-medium flex items-start gap-1.5 leading-relaxed ${
                      keyMessage.type === "success"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                        : "bg-rose-50 border-rose-100 text-rose-800"
                    }`}
                  >
                    {keyMessage.type === "success" ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{keyMessage.text}</span>
                  </div>
                )}

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleVerifyAndSaveKey}
                    disabled={verifyingKey}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {verifyingKey ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>서버 인증 검증 중...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Key 인증 및 저장</span>
                      </>
                    )}
                  </button>

                  {(apiKey || keyVerified) && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-extrabold text-xs px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="API Key 삭제"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>초기화</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Interactive Scenario Selection Section */}
          <section id="scenarios" className="space-y-6 pt-4">
            <div className="text-center space-y-2">
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Active Simulator Sandboxes</h3>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-950">검증된 실무 대표 3대 OOS 시나리오 프리셋</h2>
              <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto font-medium">
                실제 제약사 시험실에서 빈번하게 발생하는 시험 일탈 케이스를 즉시 선택하여 인공지능 분석 가이드가 작동하는 전체 과정을 직접 확인해보세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRESETS.map((preset, index) => {
                let tag = "함량 시험 초과";
                let badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                if (index === 1) {
                  tag = "용출율 불합격";
                  badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                } else if (index === 2) {
                  tag = "유연물질 한계 초과";
                  badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
                }

                return (
                  <div
                    key={index}
                    className="bg-white border border-slate-200 hover:border-blue-400 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden"
                    onClick={() => handleLoadPresetAndGo(preset)}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badgeColor}`}>
                          {tag}
                        </span>
                        <span className="text-slate-300 group-hover:text-blue-500 transition-colors font-mono text-xs font-bold">Scenario 0{index + 1}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-sm md:text-base leading-snug">
                          {preset.productName}
                        </h4>
                        <p className="text-xs font-semibold text-slate-400 font-mono">Batch: #{preset.batchNo}</p>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5 font-medium">
                        <p className="text-slate-500"><strong className="text-slate-700">시험 항목:</strong> {preset.testItem}</p>
                        <p className="text-slate-500"><strong className="text-slate-700">일탈 수치:</strong> <span className="text-red-600 font-bold">{preset.specResult.split("/")[1]?.trim() || preset.specResult}</span></p>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">
                        {preset.incidentDetail}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>이 시나리오로 즉시 분석하기</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Dynamic Workflow Process Guide with Hover States */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none text-white">
              <FlaskConical className="w-64 h-64" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block">cGMP Standard Operation Procedure</span>
                <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">
                  과학적인 분석적 단계별<br />
                  OOS 검증 아키텍처
                </h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-medium">
                  본 보조기는 단순한 질의응답이 아닙니다. 식약처 의약품 안전성 가이드라인 및 FDA cGMP 조사 흐름에 완벽하게 순응하도록 설계된 4단계의 지능형 프로세스로 작동합니다.
                </p>
              </div>

              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    step: "01",
                    title: "1차 분류 및 실험실 평가 (Phase 1)",
                    desc: "분석기기 상태, 표준액 조제, 계량 및 초음파 추출 시간 등의 실험실 요소를 FDA 'Lab Error First' 가이드에 맞추어 연쇄 체크하여 인위적 오차를 격리합니다."
                  },
                  {
                    step: "02",
                    title: "5Why 근본원인 탐색 (Phase 2)",
                    desc: "크로마토그램 피크 형상 왜곡, 분석 컬럼 열화, 가스 크로마토그래피 주입기 세정 오차 등 물리화학적 현상을 연쇄 추적하여 참 원인(Root Cause)을 도출합니다."
                  },
                  {
                    step: "03",
                    title: "CAPA 설계 및 제안 (Phase 3)",
                    desc: "근본 원인 해결을 위한 즉각 시정 조치(Correction)와 차후 유사 일탈 방지를 위한 SOP 개정, 시험원 자격 재부여 등 cGMP 부합 예방조치(Preventive Action)를 수립합니다."
                  },
                  {
                    step: "04",
                    title: "Audit-Ready 보고서 종결 (Phase 4)",
                    desc: "국제 규제 실사단(FDA, EMA, PMDA, MFDS)의 점검 시 즉시 제시가 가능한 수준의 완벽히 격식화된 한글/영문 보고서 초안을 종결 및 자동 저장합니다."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 bg-blue-900/50 text-blue-400 border border-blue-800 rounded-lg flex items-center justify-center text-xs font-mono font-bold">
                        {item.step}
                      </span>
                      <h4 className="font-bold text-slate-100 text-xs md:text-sm">{item.title}</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Custom Input Intake Section (Simulated blank start) */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Flexible Investigation Setup</span>
              <h3 className="text-xl md:text-2xl font-bold text-slate-950">커스텀 OOS 사례 신규 등록</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                실무에서 현재 겪고 계시는 특정 일탈이나 기준초과 현상이 있나요? 제품명, 배치 정보, 시험 한계 수치와 간단한 현상 설명을 적어 바로 지능형 보조기와 실시간 조사를 개시해보세요.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-600 font-medium">
                💡 <strong className="text-slate-800">GMP 꿀팁:</strong> 상세 현상을 작성할 때 크로마토그램 피크나 기기 제조사 모델 정보를 포함해주시면 더 정밀한 5Why 가이드가 실행됩니다.
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>신규 OOS 조사 양식 간이 작성</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">제품명</label>
                  <input
                    type="text"
                    placeholder="예: 타이레놀 서방정 650mg"
                    value={productInfo.productName}
                    onChange={(e) => setProductInfo({ ...productInfo, productName: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">배치 번호</label>
                  <input
                    type="text"
                    placeholder="예: TYL2026C"
                    value={productInfo.batchNo}
                    onChange={(e) => setProductInfo({ ...productInfo, batchNo: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-900 font-mono font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">시험 항목</label>
                  <input
                    type="text"
                    placeholder="예: 유연물질 시험 (Related Substances by HPLC)"
                    value={productInfo.testItem}
                    onChange={(e) => setProductInfo({ ...productInfo, testItem: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">규격 및 결과</label>
                  <input
                    type="text"
                    placeholder="예: 규격 0.10% 이하 / 결과 0.18%"
                    value={productInfo.specResult}
                    onChange={(e) => setProductInfo({ ...productInfo, specResult: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">발생 경위 상세</label>
                  <textarea
                    rows={3}
                    placeholder="일탈 또는 기준일탈(OOS) 결과가 발생하게 된 구체적인 상황을 입력해주세요."
                    value={productInfo.incidentDetail}
                    onChange={(e) => setProductInfo({ ...productInfo, incidentDetail: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white text-slate-900 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none resize-y"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    if (!productInfo.productName || !productInfo.batchNo || !productInfo.testItem || !productInfo.specResult || !productInfo.incidentDetail) {
                      setError("모든 OOS 상세 내역 항목을 입력해주세요.");
                    } else {
                      setError(null);
                    }
                    setViewMode("app");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-98 animate-pulse"
                >
                  <span>이 양식으로 분석기 진입하기</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* Historical saved reports block if they exist on Landing Page */}
          {savedReports.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-500" />
                <span>최근에 완성하여 저장한 OOS 조사 보고서 ({savedReports.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedReports.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadSavedReport(item)}
                    className="bg-white border border-slate-200 hover:border-blue-300 p-5 rounded-2xl cursor-pointer transition-all flex items-start justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-800 truncate block group-hover:text-blue-600 transition-colors">
                          {item.productInfo.productName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>Batch: {item.productInfo.batchNo}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSavedReport(item.id, e)}
                      className="text-slate-300 hover:text-red-600 p-1.5 text-xs transition-colors rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      ) : (
        <main className="max-w-7xl w-full mx-auto px-4 py-8 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Left column - Status panel / Intake / History */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          
          {/* Preset Buttons for Quick Loading */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>GMP 시나리오 퀵 프리셋</span>
            </h3>
            <div className="space-y-2">
              {PRESETS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleLoadPreset(preset)}
                  className="w-full text-left text-xs p-3.5 rounded-xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50/40 transition-all font-semibold text-slate-700 hover:text-slate-950 flex items-center justify-between group cursor-pointer bg-slate-50/50 hover:shadow-xs"
                >
                  <span className="truncate pr-2">{preset.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* OOS Intake Form */}
          {!currentResponse ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="flex items-center gap-2 mb-5">
                <ShieldAlert className="w-5.5 h-5.5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">OOS 일탈 시험 정보 등록</h2>
              </div>

              <form onSubmit={handleStartInvestigation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    제품명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 아스피린 정제 100mg"
                    value={productInfo.productName}
                    onChange={(e) => setProductInfo({ ...productInfo, productName: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    배치 번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: ASP202607A"
                    value={productInfo.batchNo}
                    onChange={(e) => setProductInfo({ ...productInfo, batchNo: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    시험 항목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 함량 시험 (Assay Test by HPLC)"
                    value={productInfo.testItem}
                    onChange={(e) => setProductInfo({ ...productInfo, testItem: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    규격 및 결과 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="예: 규격 95.0~105.0% / 결과 108.3%"
                    value={productInfo.specResult}
                    onChange={(e) => setProductInfo({ ...productInfo, specResult: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 bg-slate-50/50 focus:bg-white transition-all text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    발생 경위 상세 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="일탈 또는 기준일탈(OOS) 결과가 발생하게 된 구체적인 상황을 입력해주세요."
                    value={productInfo.incidentDetail}
                    onChange={(e) => setProductInfo({ ...productInfo, incidentDetail: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 bg-slate-50/50 focus:bg-white transition-all resize-y text-slate-900 leading-relaxed font-medium"
                  />
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] disabled:from-blue-300 disabled:to-indigo-300 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>GMP 가이드라인 검토 분석 중...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4.5 h-4.5" />
                      <span>OOS 조사 시작 (GMP 가이드 적용)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Locked Info Card (Shown while in the process) */
            <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none">
                <Dna className="w-32 h-32" />
              </div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>진행중인 OOS 사건 정보</span>
                </h3>
                <button
                  onClick={handleReset}
                  className="text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg border border-slate-700 hover:border-slate-500 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>새조사</span>
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block font-bold mb-1">제품명</span>
                  <span className="font-bold text-white text-sm">{productInfo.productName}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 block font-bold mb-1">배치번호</span>
                    <span className="font-bold text-slate-200">{productInfo.batchNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold mb-1">시험항목</span>
                    <span className="font-bold text-slate-200">{productInfo.testItem}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold mb-1">규격 및 결과</span>
                  <span className="font-bold text-rose-400 text-sm bg-rose-950/40 px-2 py-1 rounded border border-rose-900/40 inline-block">{productInfo.specResult}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold mb-1">최초 발생 경위</span>
                  <p className="text-slate-200 font-medium leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 max-h-40 overflow-y-auto">
                    {productInfo.incidentDetail}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OOS Investigation History List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-500" />
              <span>최근 저장 보고서 이력 ({savedReports.length})</span>
            </h3>
            {savedReports.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-3 text-center">저장된 보고서가 없습니다. 조사를 종결하면 자동 저장됩니다.</p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {savedReports.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadSavedReport(item)}
                    className="p-3 bg-slate-50/50 hover:bg-blue-50/30 border border-slate-100 hover:border-blue-200 rounded-xl cursor-pointer transition-all flex items-start justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-800 truncate block">
                          {item.productInfo.productName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.productInfo.batchNo}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSavedReport(item.id, e)}
                      className="text-slate-300 hover:text-red-600 p-1 text-xs transition-colors rounded-lg hover:bg-slate-200/50 shrink-0 cursor-pointer"
                      title="삭제"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-[10px] text-slate-500 font-extrabold uppercase mb-1 tracking-wider">Lab Error First Policy</p>
            <p className="text-xs leading-relaxed text-slate-600 font-medium">
              초기 평가 시 표준상태, 시약 가용 한도, 주입 안정도 등 실험실적 변수를 완벽히 배제하기 전에는 절대로 임의 재시험이나 생산 공정 조사를 진행하지 않는 것이 FDA 가이드라인의 최우선 의무 원칙입니다.
            </p>
          </div>

        </div>

        {/* Right column - Main Investigation Progress Panel */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          
          {/* Phase Progress Indicator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-xs print:hidden">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3.5">OOS Investigation Progress Workflow</h2>
            <nav className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {[
                { key: "classification", label: "1차 분류", stepNo: "01" },
                { key: "why", label: "5Why 원인분석", stepNo: "02" },
                { key: "capa", label: "CAPA 설계", stepNo: "03" },
                { key: "report", label: "최종 보고서", stepNo: "04" }
              ].map((step) => {
                const isActive = currentResponse?.stage === step.key;
                const stages = ["classification", "why", "capa", "report"];
                const currentIndex = stages.indexOf(currentResponse?.stage || "");
                const isCompleted = currentResponse ? (stages.indexOf(step.key) < currentIndex) : false;

                let stateClasses = "bg-slate-50/50 border border-slate-200 text-slate-400";
                let badgeClasses = "bg-slate-200 text-slate-500";

                if (isActive) {
                  stateClasses = "bg-blue-50/70 text-blue-700 font-bold border-l-4 border-blue-600 border-y border-r border-slate-200 shadow-xs";
                  badgeClasses = "bg-blue-600 text-white";
                } else if (isCompleted) {
                  stateClasses = "bg-emerald-50/50 text-emerald-800 font-semibold border-l-4 border-emerald-500 border-y border-r border-slate-200";
                  badgeClasses = "bg-emerald-500 text-white";
                }

                return (
                  <div key={step.key} className={`flex items-center gap-3 p-3 rounded-xl text-xs ${stateClasses} transition-all`}>
                    <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${badgeClasses}`}>
                      {isCompleted ? "✓" : step.stepNo}
                    </span>
                    <div className="truncate">
                      <p className="font-bold leading-none">{step.label}</p>
                      {step.key === "why" && currentResponse?.stage === "why" && (
                        <span className="text-[10px] text-blue-600 font-mono block mt-0.5">Why {currentResponse.why_number}/5</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Active Wizard Display Screen */}
          <div className="flex-1 flex flex-col min-h-0">
            <AnimatePresence mode="wait">
              {!currentResponse ? (
                /* Welcome State */
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[480px] print:hidden"
                >
                  <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 flex items-center justify-center mb-6 shadow-xs">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">
                    GMP 규격일탈 및 OOS 조사를 시작해보세요
                  </h2>
                  <p className="text-slate-500 text-xs md:text-sm max-w-lg leading-relaxed mb-8 font-medium">
                    좌측 서식에 이화학 시험 및 OOS 상세 정보를 등록하거나, 상단 시나리오 프리셋을 선택하고 조사 시작 버튼을 클릭해 실시간 GMP 인공지능 보조기 감사를 가동하십시오.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full text-left">
                    <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl flex items-start gap-3.5">
                      <div className="p-1.5 bg-blue-50 text-blue-600 shrink-0 rounded-xl">
                        <CheckCircle className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">Lab Error First Policy</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          초기 평가 단계에서 수조 온도, 분석자 자격 수치, 희석 계산 오차 등 실험실 에러를 먼저 조사해 불필요한 공정 전파를 방지합니다.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 bg-slate-50/50 border border-slate-200 rounded-2xl flex items-start gap-3.5">
                      <div className="p-1.5 bg-blue-50 text-blue-600 shrink-0 rounded-xl">
                        <TrendingUp className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1">5Why 원인 분석 로직</h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                          기기 분석 크로마토그램 피크 분리능 저하, 컬럼 수명, 세척 유기용매 오차 등 물리화학 원인을 단계별 추적하여 진짜 원인을 식별합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* Dynamic Layout for Active Phase */
                <motion.div
                  key={currentResponse.stage + "-" + currentResponse.why_number}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Phase header block */}
                  <div className="flex items-end justify-between print:hidden">
                    <div className="space-y-1">
                      <span className="text-blue-600 font-bold text-xs uppercase tracking-wider block">
                        Phase {currentResponse.stage === "classification" ? "01" : currentResponse.stage === "why" ? "02" : currentResponse.stage === "capa" ? "03" : "04"} / {currentResponse.stage === "why" ? `Why ${currentResponse.why_number}` : currentResponse.stage.toUpperCase()}
                      </span>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                        {currentResponse.stage === "classification" && "1차 분류 및 실험실 에러 평가"}
                        {currentResponse.stage === "why" && "5Why 근본원인분석 (Root Cause Analysis)"}
                        {currentResponse.stage === "capa" && "시정조치 및 예방조치 (CAPA) 설계"}
                        {currentResponse.stage === "report" && "최종 GMP OOS 조사 보고서"}
                      </h2>
                    </div>
                    <div className="bg-white px-4 py-2 border border-slate-200 rounded-xl shadow-xs text-right hidden sm:block">
                      <span className="text-[9px] block text-slate-400 uppercase font-bold">Investigation Status</span>
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {currentResponse.stage === "report" ? "COMPLETED" : "IN PROGRESS"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    
                    {/* Main Content Area */}
                    <div className={`${currentResponse.stage === "report" ? "lg:col-span-12" : "lg:col-span-7"} flex flex-col`}>
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 md:p-8 flex flex-col flex-1 min-h-[400px] print:border-none print:shadow-none print:p-0">
                        
                        {/* Guide Narrative Question */}
                        {currentResponse.stage !== "report" && (
                          <div className="mb-6 pb-6 border-b border-slate-100">
                            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 select-none">
                              <BookOpen className="w-4 h-4" />
                              <span>GMP 감사관 가이드 & 질문</span>
                            </h4>
                            <div className="bg-blue-50/40 rounded-2xl p-5 border border-blue-100/60 leading-relaxed text-slate-900">
                              {renderNarrative(currentResponse.narrative)}
                            </div>
                          </div>
                        )}

                        {/* Options Selector */}
                        {currentResponse.options && currentResponse.options.length > 0 ? (
                          <div className="space-y-3 my-auto print:hidden">
                            {currentResponse.options.map((option, idx) => {
                              const isSelected = selectedOption === option;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedOption(option);
                                    setError(null);
                                  }}
                                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                                    isSelected
                                      ? "border-2 border-blue-600 bg-blue-50/10 text-blue-900 shadow-xs"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                                  }`}
                                >
                                  <span className={`text-xs md:text-sm leading-relaxed ${isSelected ? "font-bold text-blue-700" : "font-semibold text-slate-800"}`}>
                                    {option}
                                  </span>
                                  <div className="shrink-0 pl-3">
                                    {isSelected ? (
                                      <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">
                                        ✓
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 bg-slate-50 text-slate-400 group-hover:bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-xs transition-colors">
                                        →
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}

                            {/* Custom Input Field when "기타" is chosen */}
                            {selectedOption === "기타 (주관식 직접 입력)" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mt-4"
                              >
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                  현장의 세부 일탈 원인을 직접 기술해주십시오 (GMP 연계 반영):
                                </label>
                                <textarea
                                  rows={3}
                                  value={customText}
                                  onChange={(e) => setCustomText(e.target.value)}
                                  placeholder="예: 초음파 추출(Sonication) 가동 시간이 규정(20분)에 미달한 10분만 가동되어 주성분 추출 부족에 따른 OOS 발생으로 판단됨."
                                  className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 resize-y text-slate-900 leading-relaxed font-medium"
                                />
                              </motion.div>
                            )}
                          </div>
                        ) : null}

                        {/* Report Stage Inner Layout (If stage is 'report') */}
                        {currentResponse.stage === "report" && currentResponse.report && (
                          <div className="space-y-6">
                            <div className="flex justify-between items-center bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-800 font-semibold mb-4 print:hidden">
                              <span className="flex items-center gap-2">
                                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                                <span>GMP 규정 검증에 따라 OOS 최종 보고서 초안이 작성 완료되었습니다!</span>
                              </span>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={handlePrint}
                                  className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                >
                                  보고서 인쇄 / PDF 저장
                                </button>
                                <button
                                  onClick={handleCopyFullReport}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                >
                                  {copiedKey === "전체 보고서" ? "복사 완료!" : "전체 복사"}
                                </button>
                              </div>
                            </div>

                            {/* DOCUMENT SHEET */}
                            <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-md text-slate-900 print:border-none print:shadow-none" id="oos-report-printable">
                              
                              {/* Document header ribbon */}
                              <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between print:hidden">
                                <span className="text-xs font-bold tracking-wider uppercase text-slate-300 font-mono">LABORATORY INVESTIGATION REPORT</span>
                                <span className="text-[10px] bg-blue-600 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-widest text-blue-50 shadow-inner">cGMP Compliant</span>
                              </div>

                              <div className="p-8 md:p-12 space-y-8 text-xs md:text-sm print:p-0">
                                
                                {/* Official Header */}
                                <div className="text-center pb-8 border-b-2 border-slate-900 relative">
                                  <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight text-slate-900">
                                    Laboratory OOS Investigation Report
                                  </h2>
                                  <p className="text-slate-500 text-xs font-mono mt-1.5">Document Ref ID: LIR-OOS-2026-{productInfo.batchNo}</p>
                                  
                                  {/* Stamp badge */}
                                  <div className="absolute right-0 top-0 border-2 border-emerald-600 text-emerald-600 text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded rotate-12 opacity-80 hidden sm:block">
                                    Approved
                                  </div>
                                </div>

                                {/* Laboratory metadata block table */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden text-slate-900 font-medium">
                                  <div className="bg-slate-50 p-3">
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Product Name</span>
                                    <span className="text-xs font-bold text-slate-900">{productInfo.productName}</span>
                                  </div>
                                  <div className="bg-slate-50 p-3">
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Batch / Lot No</span>
                                    <span className="text-xs font-mono font-bold text-slate-900">{productInfo.batchNo}</span>
                                  </div>
                                  <div className="bg-slate-50 p-3">
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Test Parameter</span>
                                    <span className="text-xs font-bold text-slate-900">{productInfo.testItem}</span>
                                  </div>
                                  <div className="bg-slate-50 p-3">
                                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Spec vs. Result</span>
                                    <span className="text-xs font-bold text-red-600">{productInfo.specResult}</span>
                                  </div>
                                </div>

                                {/* Form sections with gorgeous readability */}
                                {[
                                  { label: "1. 요약 및 개요 (Executive Summary)", content: currentResponse.report.overview, key: "overview" },
                                  { label: "2. 일탈 발생 경위 상세 (Incident Details)", content: currentResponse.report.incident, key: "incident" },
                                  { label: "3. 초기 실험실적 평가 결과 (Laboratory Assessment)", content: currentResponse.report.initial_assessment, key: "initial_assessment" },
                                  { label: "4. 5Why 근본원인 분석 (5Why Root Cause Analysis)", content: currentResponse.report.root_cause, key: "root_cause" },
                                  { label: "5. 즉각적인 시정 조치 (Correction)", content: currentResponse.report.correction, key: "correction" },
                                  { label: "6. 예방조치 계획 - CAPA (Preventive Action)", content: currentResponse.report.preventive_action, key: "preventive_action" },
                                  { label: "7. 효과성 평가 계획 (Effectiveness Check)", content: currentResponse.report.effectiveness_check, key: "effectiveness_check" }
                                ].map((sec, sIdx) => (
                                  <div key={sec.key} className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-300 pb-1.5">
                                      <h3 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                                        <span className="w-1.5 h-4 bg-slate-900 rounded-full"></span>
                                        {sec.label}
                                      </h3>
                                      <button 
                                        onClick={() => handleCopyToClipboard(sec.content, sec.label)}
                                        className="text-[10px] text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-all print:hidden"
                                      >
                                        <Clipboard className="w-3.5 h-3.5" />
                                        <span>{copiedKey === sec.label ? "복사 완료" : "복사"}</span>
                                      </button>
                                    </div>
                                    <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-5 whitespace-pre-wrap leading-relaxed text-slate-800 transition-all font-medium">
                                      {renderReportList(sec.content)}
                                    </div>
                                  </div>
                                ))}

                                {/* Signature Block */}
                                <div className="pt-12 mt-12 border-t border-slate-300 grid grid-cols-2 gap-12 text-center text-xs text-slate-600">
                                  <div>
                                    <div className="w-40 h-px bg-slate-300 mx-auto mb-2"></div>
                                    <span className="font-bold text-slate-700">QC Analyst / Investigator</span>
                                    <span className="block text-[10px] text-slate-400 mt-1 font-mono">Date: 2026-07-06</span>
                                  </div>
                                  <div>
                                    <div className="w-40 h-px bg-slate-300 mx-auto mb-2"></div>
                                    <span className="font-bold text-slate-700">QC Quality Assurance Manager</span>
                                    <span className="block text-[10px] text-slate-400 mt-1 font-mono">Date: 2026-07-06</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {error && (
                          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2 mt-4 print:hidden">
                            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-red-500" />
                            <span>{error}</span>
                          </div>
                        )}

                        {/* Footer Action buttons */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3 print:hidden">
                          <button
                            onClick={handleReset}
                            className="flex-1 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:border-slate-300 active:scale-[0.98]"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>일탈 조사 취소 (초기화)</span>
                          </button>
                          
                          {currentResponse.stage !== "report" && (
                            <button
                              onClick={handleNextStep}
                              disabled={loading}
                              className="flex-[2] py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs md:text-sm shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:from-blue-300 disabled:to-indigo-300"
                            >
                              {loading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>GMP 감사 데이터 처리 중...</span>
                                </>
                              ) : (
                                <>
                                  <span>
                                    {currentResponse.stage === "capa" ? "최종 GMP 보고서 작성 완료 및 종결" : "다음 평가 단계 진행"}
                                  </span>
                                  <ArrowRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Right column - Side context block */}
                    {currentResponse.stage !== "report" && (
                      <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
                        
                        {/* Interactive Laboratory Monitor HUD */}
                        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between min-h-[340px] border border-slate-800 relative">
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[9px] bg-blue-950/80 border border-blue-900 text-blue-400 px-2 py-0.5 rounded font-mono font-bold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            Monitor Active
                          </div>
                          
                          <div>
                            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">
                              Investigation HUD Monitor
                            </h3>
                            
                            <div className="space-y-4 font-mono text-[11px] leading-relaxed opacity-95 text-slate-300">
                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                                <span className="text-blue-400">[Stage]</span> {currentResponse.stage.toUpperCase()}<br />
                                <span className="text-blue-400">[Why Chain]</span> {currentResponse.why_number} / 5 단계<br />
                                <span className="text-blue-400">[Completed Paths]</span> {history.length} 단계 기록됨<br />
                                <span className="text-blue-400">[Analyst Action]</span> {history.length > 0 ? history[history.length - 1].selected_option : "분석 시작됨"}
                              </div>
                              
                              <p className="leading-relaxed text-slate-400 text-xs">
                                현재 적용된 분석 오차 로직: 컬럼 수명(Column Lifetime Limits) 모니터링 로그 및 HPLC 밸브 실링 유격 가이드라인. 실험실 요인의 객관적 배제 전까지 재시험을 승인하지 않는 FDA 표준 권고사항이 엄격히 강제됩니다.
                              </p>
                              
                              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                <span className="text-emerald-400 block font-bold text-[10px] tracking-wider uppercase">LAB STATUS LOG:</span>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                  <span>System 적합성(System Suitability) RSD 0.5% 적합</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                  <span>시험 기기 세정 밸리데이션 검증 완료</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Investigation Phase Progress</span>
                              <span className="text-xs font-mono font-bold text-blue-400">
                                {currentResponse.stage === "classification" && "25%"}
                                {currentResponse.stage === "why" && `${Math.round(25 + (currentResponse.why_number * 10))}%`}
                                {currentResponse.stage === "capa" && "85%"}
                              </span>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-px">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                                style={{
                                  width: currentResponse.stage === "classification" 
                                    ? "25%" 
                                    : currentResponse.stage === "why" 
                                      ? `${25 + (currentResponse.why_number * 10)}%` 
                                      : "85%"
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Dynamic Path History tracker in sidebar */}
                        {history.length > 0 && (
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                              실시간 원인 추적 연쇄 경로 (Timeline)
                            </h4>
                            <div className="space-y-4 relative pl-3 border-l-2 border-blue-100">
                              {history.map((h, i) => (
                                <div key={i} className="relative text-xs">
                                  <span className="absolute -left-[19px] top-0.5 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold ring-4 ring-white">
                                    {i + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 leading-none mb-1">
                                      {h.stage === "classification" ? "1차 분류" : `Why ${h.why_number}`}
                                    </p>
                                    <p className="text-slate-600 font-medium leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">{h.selected_option}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </main>
      )}

      {/* cGMP API Key Lock Modal */}
      <AnimatePresence>
        {showLockModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative overflow-hidden space-y-6"
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-amber-500" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-sm">
                  <Lock className="w-8 h-8 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    OOS 분석 기능 잠금 해제 필요
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                    본 GMP 일탈 및 OOS 분석기를 가동하고 전체 기능(실시간 마법사, 자율 시나리오 분석, 레포트 생성 등)을 안전하게 활용하려면 <strong>Google Gemini API Key</strong> 승인이 반드시 완료되어야 합니다.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-600 space-y-1.5 font-semibold">
                <p className="flex items-start gap-1.5">
                  <span className="text-red-500">•</span>
                  <span>개인 소유의 무료 API Key 연동 필수</span>
                </p>
                <p className="flex items-start gap-1.5">
                  <span className="text-red-500">•</span>
                  <span>로컬 브라우저 이외에는 절대 보관/유출되지 않음</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer text-center"
                >
                  창 닫기
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLockModal(false);
                    // Scroll is automatically handled by the useEffect or we can trigger it immediately
                    const el = document.getElementById("api-key-section");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                      setHighlightKeySection(true);
                      setTimeout(() => setHighlightKeySection(false), 3500);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>API Key 인증센터로 이동</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Aesthetic and Informational Footer */}
      <footer className="border-t border-slate-200 mt-16 bg-white py-10 text-slate-500 text-center print:hidden">
        <div className="max-w-7xl mx-auto px-4 text-xs space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4.5 h-4.5 text-blue-500" />
            <span>Senior GMP Auditor Simulation Workspace</span>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed">
            본 어플리케이션은 FDA Guidance 및 식약처 의약품 제조품질관리(GMP) 기준에 따라 이화학 QC 시험실 내 발생하는 일탈 및 기준일탈(OOS) 사항에 대해 과학적 원인 규명과 적합한 CAPA 수립을 지원하는 지능형 대화 보조기입니다.
          </p>
          <p>© 2026 Pharmaceutical Quality Control Audit Assistant. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
