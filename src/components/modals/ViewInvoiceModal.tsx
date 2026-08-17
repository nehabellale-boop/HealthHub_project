import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2, CreditCard, DollarSign } from 'lucide-react';
import { ShieldHeartbeatIcon } from '../common/BrandLogo';
import { Invoice } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ViewInvoiceModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSettlePayment?: (id: number) => void;
}

export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  invoice,
  onClose,
  onSettlePayment,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[1055] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in my-auto">
        {/* Invoice Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
              <ShieldHeartbeatIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                HEALTHHUB HOSPITAL
              </h2>
              <p className="text-xs text-slate-500">
                Official Clinical Tax Invoice &bull; Tax ID: US-EIN-9920194
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-900">
                  {invoice.invoiceNumber}
                </span>
                <StatusBadge status={invoice.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors d-print-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Patient and Doctor Info */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 mb-6 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Billed To (Patient)
            </span>
            <div className="font-bold text-slate-900 text-sm">{invoice.patientName}</div>
            <div className="text-slate-500">Billing Date: {invoice.date}</div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Consulting Specialist
            </span>
            <div className="font-bold text-slate-900 text-sm">{invoice.doctorName}</div>
            <div className="text-slate-500">{invoice.departmentName || 'Clinical Consultation'}</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 text-xs">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="py-2.5 px-4 text-left">Clinical Service Description</th>
                <th className="py-2.5 px-4 text-center">Qty</th>
                <th className="py-2.5 px-4 text-right">Fee (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 px-4 text-slate-800">
                  <div className="font-medium">Specialist Clinical Outpatient Evaluation</div>
                  <div className="text-[11px] text-slate-400">Diagnosis, vital check, prescription issuance</div>
                </td>
                <td className="py-3 px-4 text-center text-slate-600">1</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">
                  ₹{invoice.totalAmount}.00
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals Breakdown */}
          <div className="bg-slate-50/80 p-4 border-t border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium">₹{invoice.totalAmount}.00</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Amount Paid ({invoice.paymentMode}):</span>
              <span className="font-bold">-₹{invoice.paidAmount}.00</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
              <span>Balance Due:</span>
              <span className={invoice.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                ₹{invoice.dueAmount}.00
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Official HealthHub Financial Record</span>
          </div>

          <div className="flex items-center gap-2 d-print-none">
            {invoice.dueAmount > 0 && onSettlePayment && (
              <button
                onClick={() => onSettlePayment(invoice.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Settle Balance (₹{invoice.dueAmount})</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
