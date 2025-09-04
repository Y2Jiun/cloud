import { Response } from "express";
import { prisma } from "../index";
import { AuthRequest } from "../middleware/auth";

function monthsBackLabels(n: number): string[] {
  const now = new Date();
  const labels: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString("en", { month: "short" }));
  }
  return labels;
}

function isWithinLastMonths(date: Date, n: number): boolean {
  const from = new Date();
  from.setMonth(from.getMonth() - (n - 1));
  from.setDate(1);
  const to = new Date();
  to.setMonth(to.getMonth() + 1);
  to.setDate(1);
  return date >= from && date < to;
}

// Relaxed typing to avoid strict assignment issues during compilation
function bucketByMonth(items: any[], n: number): number[] {
  const buckets = Array(n).fill(0);
  const start = new Date();
  start.setMonth(start.getMonth() - (n - 1));
  start.setDate(1);
  items.forEach((it) => {
    const dt: Date | undefined =
      (it as any).createdAt || (it as any).created_at;
    if (!dt || !isWithinLastMonths(dt, n)) return;
    const monthsDiff =
      (dt.getFullYear() - start.getFullYear()) * 12 +
      (dt.getMonth() - start.getMonth());
    if (monthsDiff >= 0 && monthsDiff < n) buckets[monthsDiff] += 1;
  });
  return buckets;
}

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.id);
    const role = req.user?.roles;

    let data: any = { role };

    if (role === 1) {
      // Admin - system-wide overview and pending approvals
      const [
        totalUsers,
        totalFAQs,
        reportsTotal,
        reportsPending,
        reportsApproved,
        reportsRejected,
        alertsTotal,
        alertsPending,
        alertsApproved,
        alertsRejected,
        casesTotal,
        casesPending,
        casesApproved,
        casesRejected,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.fAQ.count(),
        prisma.scamReport.count(),
        prisma.scamReport.count({ where: { status: "pending" } }),
        prisma.scamReport.count({ where: { status: "approved" } }),
        prisma.scamReport.count({ where: { status: "rejected" } }),
        prisma.scamAlert.count(),
        prisma.scamAlert.count({ where: { status: "pending" } }),
        prisma.scamAlert.count({ where: { status: "approved" } }),
        prisma.scamAlert.count({ where: { status: "rejected" } }),
        prisma.legalCase.count(),
        prisma.legalCase.count({ where: { status: "pending" } }),
        prisma.legalCase.count({ where: { status: "approved" } }),
        prisma.legalCase.count({ where: { status: "rejected" } }),
      ]);

      data = {
        ...data,
        totalUsers,
        totalFAQs,
        scamReports: {
          total: reportsTotal,
          pending: reportsPending,
          approved: reportsApproved,
          rejected: reportsRejected,
        },
        scamAlerts: {
          total: alertsTotal,
          pending: alertsPending,
          approved: alertsApproved,
          rejected: alertsRejected,
        },
        legalCases: {
          total: casesTotal,
          pending: casesPending,
          approved: casesApproved,
          rejected: casesRejected,
        },
      };
    } else if (role === 2) {
      // Legal Officer - own alerts/cases + approved visibility
      const [
        myAlertsTotal,
        myAlertsPending,
        myAlertsApproved,
        myAlertsRejected,
        myCasesTotal,
        myCasesPending,
        myCasesApproved,
        myCasesRejected,
      ] = await Promise.all([
        prisma.scamAlert.count({ where: { createdBy: userId } }),
        prisma.scamAlert.count({
          where: { createdBy: userId, status: "pending" },
        }),
        prisma.scamAlert.count({
          where: { createdBy: userId, status: "approved" },
        }),
        prisma.scamAlert.count({
          where: { createdBy: userId, status: "rejected" },
        }),
        prisma.legalCase.count({ where: { createdBy: userId } }),
        prisma.legalCase.count({
          where: { createdBy: userId, status: "pending" },
        }),
        prisma.legalCase.count({
          where: { createdBy: userId, status: "approved" },
        }),
        prisma.legalCase.count({
          where: { createdBy: userId, status: "rejected" },
        }),
      ]);

      data = {
        ...data,
        myScamAlerts: {
          total: myAlertsTotal,
          pending: myAlertsPending,
          approved: myAlertsApproved,
          rejected: myAlertsRejected,
        },
        myLegalCases: {
          total: myCasesTotal,
          pending: myCasesPending,
          approved: myCasesApproved,
          rejected: myCasesRejected,
        },
      };
    } else {
      // Regular User - own reports + approved alerts/cases visibility
      const [
        myReportsTotal,
        myReportsPending,
        myReportsApproved,
        myReportsRejected,
        visibleAlertsApproved,
        visibleCasesApproved,
      ] = await Promise.all([
        prisma.scamReport.count({ where: { userId } }),
        prisma.scamReport.count({ where: { userId, status: "pending" } }),
        prisma.scamReport.count({ where: { userId, status: "approved" } }),
        prisma.scamReport.count({ where: { userId, status: "rejected" } }),
        prisma.scamAlert.count({ where: { status: "approved" } }),
        prisma.legalCase.count({ where: { status: "approved" } }),
      ]);

      const myChecklists = await prisma.userChecklist.count({
        where: { userId },
      });

      data = {
        ...data,
        myScamReports: {
          total: myReportsTotal,
          pending: myReportsPending,
          approved: myReportsApproved,
          rejected: myReportsRejected,
        },
        approvedContent: {
          alerts: visibleAlertsApproved,
          cases: visibleCasesApproved,
        },
        myChecklists,
      };
    }

    res.json({ success: true, data });
    return;
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error getting dashboard stats" });
    return;
  }
};

export const getDashboardSeries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = Number(req.user?.id);
    const role = req.user?.roles;
    const months = 12;
    const labels = monthsBackLabels(months);

    if (role === 1) {
      const [reports, alerts] = await Promise.all([
        prisma.scamReport.findMany({ select: { createdAt: true } }),
        prisma.scamAlert.findMany({ select: { createdAt: true } }),
      ]);
      const series = [
        { name: "Reports", data: bucketByMonth(reports as any[], months) },
        { name: "Alerts", data: bucketByMonth(alerts as any[], months) },
      ];
      res.json({
        success: true,
        data: { labels, series, title: "Reports & Alerts (Last 12 months)" },
      });
      return;
    }

    if (role === 2) {
      const [myAlerts, myCases] = await Promise.all([
        prisma.scamAlert.findMany({
          where: { createdBy: userId },
          select: { createdAt: true },
        }),
        prisma.legalCase.findMany({
          where: { createdBy: userId },
          select: { createdAt: true },
        }),
      ]);
      const series = [
        { name: "My Alerts", data: bucketByMonth(myAlerts as any[], months) },
        { name: "My Cases", data: bucketByMonth(myCases as any[], months) },
      ];
      res.json({
        success: true,
        data: { labels, series, title: "My Alerts & Cases (Last 12 months)" },
      });
      return;
    }

    // User role
    const [myReports, approvedAlerts] = await Promise.all([
      prisma.scamReport.findMany({
        where: { userId },
        select: { createdAt: true },
      }),
      prisma.scamAlert.findMany({
        where: { status: "approved" },
        select: { createdAt: true },
      }),
    ]);
    const series = [
      { name: "My Reports", data: bucketByMonth(myReports as any[], months) },
      {
        name: "Approved Alerts",
        data: bucketByMonth(approvedAlerts as any[], months),
      },
    ];
    res.json({
      success: true,
      data: {
        labels,
        series,
        title: "My Reports & Approved Alerts (Last 12 months)",
      },
    });
    return;
  } catch (error) {
    console.error("Get dashboard series error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error getting dashboard series" });
    return;
  }
};

export const getRecentActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get recent users and customers for activity feed
    const [recentUsers, recentCustomers] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { created_at: "desc" },
        select: { userid: true, username: true, email: true, created_at: true },
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ]);

    const activities = [
      ...recentUsers.map((user) => ({
        id: `user-${user.userid}`,
        type: "user_registered" as const,
        description: `${user.username} registered`,
        timestamp: user.created_at,
        userId: user.userid,
      })),
      ...recentCustomers.map((customer) => ({
        id: `customer-${customer.id}`,
        type: "customer_created" as const,
        description: `New customer ${customer.name} added`,
        timestamp: customer.createdAt,
        customerId: customer.id,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error getting recent activity" });
  }
};
