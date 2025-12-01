import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../../core/ui/responsive_layout.dart';
import '../providers/dashboard_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(dashboardProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell),
            onPressed: () {},
          ),
        ],
      ),
      body: state.isLoading
          ? const Center(child: CircularProgressIndicator())
          : state.error != null
              ? Center(child: Text('Error: ${state.error}'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: ResponsiveLayout(
                    mobileBody: _DashboardGrid(stats: state.stats, crossAxisCount: 2),
                    desktopBody: _DashboardGrid(stats: state.stats, crossAxisCount: 4),
                  ),
                ),
    );
  }
}

class _DashboardGrid extends StatelessWidget {
  final dynamic stats; // Using dynamic for simplicity, ideally DashboardStatsEntity
  final int crossAxisCount;

  const _DashboardGrid({required this.stats, required this.crossAxisCount});

  @override
  Widget build(BuildContext context) {
    if (stats == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Overview',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: crossAxisCount,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            _StatCard(
              title: 'Total Applications',
              value: stats.totalApplications.toString(),
              icon: LucideIcons.fileText,
              color: Colors.blue,
            ),
            _StatCard(
              title: 'Pending Review',
              value: stats.pendingApplications.toString(),
              icon: LucideIcons.clock,
              color: Colors.orange,
            ),
            _StatCard(
              title: 'Approved',
              value: stats.approvedApplications.toString(),
              icon: LucideIcons.checkCircle,
              color: Colors.green,
            ),
            _StatCard(
              title: 'Establishments',
              value: stats.totalEstablishments.toString(),
              icon: LucideIcons.sprout,
              color: Colors.purple,
            ),
          ],
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              backgroundColor: color.withOpacity(0.1),
              child: Icon(icon, color: color),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
