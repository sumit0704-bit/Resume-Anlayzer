import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf, deleteAllReports } from "../services/interview.api"; // ✅ import deleteAllReports
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {

    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error("useInterview must be used within InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        try {
            const res = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            setReport(res.report);
            return res.report;
        } catch (err) {
            console.error("Generate Error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (id) => {
        setLoading(true);
        try {
            const res = await getInterviewReportById(id);
            setReport(res);
            return res;
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getReports = async () => {
        setLoading(true);
        try {
            const res = await getAllInterviewReports();
            setReports(res);
            return res;
        } catch (err) {
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const getResumePdf = async (id) => {
        setLoading(true);
        try {
            const blob = await generateResumePdf({ interviewReportId: id });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.download = `resume_${id}.pdf`;
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED — deletes from DB then clears UI
    const clearReports = async () => {
        setLoading(true);
        try {
            await deleteAllReports();
            setReports([]); // ✅ clear UI only after DB confirms deletion
        } catch (err) {
            console.error("Clear Reports Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (interviewId) getReportById(interviewId);
        else getReports();
    }, [interviewId]);

    return { loading, generateReport, reports, clearReports, getResumePdf, report, getReportById };
};