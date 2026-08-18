import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // GET REPORTS
  // =========================================

  const fetchReports = async () => {
    try {
      setError("");

      const res = await API.get("/reports");

      setReports(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // LOAD REPORTS
  // =========================================

  useEffect(() => {
    if (user?.isAdmin) {
      fetchReports();
    }
  }, [user]);

  // =========================================
  // MARK REPORT AS REVIEWED
  // =========================================

  const updateStatus = async (reportId, status) => {
    try {
      setError("");

      const res = await API.put(`/reports/${reportId}`, {
        status,
      });

      setReports((previousReports) =>
        previousReports.map((report) =>
          report._id === reportId ? res.data : report,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update report");
    }
  };

  // =========================================
  // KEEP OR SUSPEND ACCOUNT
  // =========================================

  const handleAccountAction = async (reportId, action) => {
    try {
      setError("");

      const res = await API.put(`/reports/${reportId}/action`, {
        action,
      });

      setReports((previousReports) =>
        previousReports.map((report) =>
          report._id === reportId ? res.data : report,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to perform action");
    }
  };

  // =========================================
  // WAIT FOR AUTH TO RESOLVE BEFORE DECIDING
  // =========================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6FFEA] flex items-center justify-center">
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  // =========================================
  // ONLY ADMIN
  // =========================================

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FFEA] flex items-center justify-center">
        <p className="text-gray-600 font-medium">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FFEA] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <p className="uppercase tracking-[0.2em] text-xs font-bold text-[#FA855A]">
          FriendLoop Admin
        </p>

        <h1 className="text-4xl font-black !text-black mt-2">Reports</h1>

        <p className="text-gray-500 mt-2 mb-8">
          Review reports submitted by FriendLoop users.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* No Reports */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-[28px] p-10 text-center border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold !text-black">No reports yet</h2>

            <p className="text-gray-500 mt-2">
              Reports submitted by users will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* ================================= */}
                  {/* LEFT SIDE */}
                  {/* ================================= */}

                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                      Reported User
                    </p>

                    <h2 className="text-2xl font-black !text-black mt-1">
                      {report.reportedUser?.name}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {report.reportedUser?.email}
                    </p>

                    {/* Suspended badge */}
                    {report.reportedUser?.isSuspended && (
                      <span className="inline-block mt-3 px-3 py-1 bg-red-50 text-[#C93638] rounded-full text-xs font-bold">
                        Account Suspended
                      </span>
                    )}

                    {/* Reason */}
                    <div className="mt-5">
                      <p className="text-sm text-gray-700">
                        <span className="font-bold">Reason:</span>{" "}
                        {report.reason}
                      </p>

                      {report.description && (
                        <p className="mt-2 text-gray-600">
                          {report.description}
                        </p>
                      )}
                    </div>

                    {/* Reporter */}
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400">Reported by</p>

                      <p className="font-semibold text-gray-700">
                        {report.reportedBy?.name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {report.reportedBy?.email}
                      </p>
                    </div>
                  </div>

                  {/* ================================= */}
                  {/* RIGHT SIDE */}
                  {/* ================================= */}

                  <div className="md:w-60">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">
                      Status
                    </p>

                    {/* Status Badge */}
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                        report.status === "pending"
                          ? "bg-[#FFDE96]/50 text-gray-700"
                          : report.status === "reviewed"
                            ? "bg-[#F3FBFD] text-gray-700"
                            : "bg-green-50 text-green-700"
                      }`}
                    >
                      {report.status}
                    </span>

                    {/* ================================= */}
                    {/* PENDING */}
                    {/* ================================= */}

                    {report.status === "pending" && (
                      <div className="mt-5">
                        <button
                          onClick={() => updateStatus(report._id, "reviewed")}
                          className="w-full bg-[#62C4DA] hover:bg-[#4DB4CC] text-white py-2.5 rounded-xl font-semibold transition"
                        >
                          Mark Reviewed
                        </button>
                      </div>
                    )}

                    {/* ================================= */}
                    {/* REVIEWED */}
                    {/* ================================= */}

                    {report.status === "reviewed" && (
                      <div className="mt-5">
                        <p className="text-xs text-gray-500 mb-3">
                          Decide what to do with this account.
                        </p>

                        <div className="flex flex-col gap-2">
                          {/* Keep Account */}
                          <button
                            onClick={() =>
                              handleAccountAction(report._id, "keep")
                            }
                            className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-xl font-semibold transition"
                          >
                            Keep Account
                          </button>

                          {/* Suspend Account */}
                          <button
                            onClick={() =>
                              handleAccountAction(report._id, "suspend")
                            }
                            className="w-full bg-[#C93638] hover:bg-[#B52C2E] text-white py-2.5 rounded-xl font-semibold transition"
                          >
                            Suspend Account
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ================================= */}
                    {/* RESOLVED */}
                    {/* ================================= */}

                    {report.status === "resolved" && (
                      <div className="mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                          Decision
                        </p>

                        {report.actionTaken === "suspended" ? (
                          <p className="mt-2 font-bold text-[#C93638]">
                            Account Suspended
                          </p>
                        ) : report.actionTaken === "kept" ? (
                          <p className="mt-2 font-bold text-green-700">
                            Account Kept
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-gray-500">
                            No decision recorded
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
