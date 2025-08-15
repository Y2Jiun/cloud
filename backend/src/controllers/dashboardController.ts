import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalCustomers] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count()
    ]);

    // Mock data for revenue and orders (you can implement these based on your business logic)
    const stats = {
      totalUsers,
      totalCustomers,
      totalRevenue: 45231.89, // Mock data
      totalOrders: 1234, // Mock data
      growth: {
        users: 12.5,
        customers: 8.3,
        revenue: 15.2,
        orders: 6.7
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting dashboard stats'
    });
  }
};

export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    // Get recent users and customers for activity feed
    const [recentUsers, recentCustomers] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true
        }
      }),
      prisma.customer.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      })
    ]);

    // Format activity data
    const activities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registered' as const,
        description: `${user.firstName} ${user.lastName} registered`,
        timestamp: user.createdAt,
        userId: user.id
      })),
      ...recentCustomers.map(customer => ({
        id: `customer-${customer.id}`,
        type: 'customer_created' as const,
        description: `New customer ${customer.name} added`,
        timestamp: customer.createdAt,
        customerId: customer.id
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 10);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error getting recent activity'
    });
  }
};
