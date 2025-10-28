/**
 * Report Data Transfer Objects (DTOs)
 *
 * Format report data for API responses.
 * Part of Clean Architecture - Presentation Layer
 */

class ReportDTO {
  static toResponse(report) {
    if (!report) return null;

    return {
      id: report.id,
      title: report.title,
      description: report.description,
      type: report.type,
      category: report.category,
      format: report.format,

      requestedBy: report.requestedBy,
      requestedByType: report.requestedByType,

      parameters: report.parameters,
      filters: report.filters,
      columns: report.columns,
      sortBy: report.sortBy,
      sortOrder: report.sortOrder,

      schedule: report.schedule,
      scheduledAt: report.scheduledAt,
      nextRunAt: report.nextRunAt,
      lastRunAt: report.lastRunAt,

      status: report.status,
      generatedAt: report.generatedAt,
      completedAt: report.completedAt,
      failureReason: report.failureReason,
      retryCount: report.retryCount,
      maxRetries: report.maxRetries,

      fileName: report.fileName,
      fileSize: report.fileSize,
      fileSizeFormatted: report.getFileSizeFormatted(),
      downloadUrl: report.downloadUrl,
      expiresAt: report.expiresAt,
      daysUntilExpiration: report.getDaysUntilExpiration(),

      summary: report.summary,
      recordCount: report.recordCount,

      isPublic: report.isPublic,
      sharedWith: report.sharedWith,

      tags: report.tags,
      metadata: report.metadata,
      downloadCount: report.downloadCount,
      viewCount: report.viewCount,

      createdAt: report.createdAt,
      updatedAt: report.updatedAt,

      // Computed fields
      isPending: report.isPending(),
      isGenerating: report.isGenerating(),
      isCompleted: report.isCompleted(),
      isFailed: report.isFailed(),
      isExpired: report.isExpired(),
      isScheduled: report.isScheduled(),
      isDueForGeneration: report.isDueForGeneration(),
      canRetry: report.canRetry(),
      generationDuration: report.getGenerationDuration()
    };
  }

  static toListResponse(reports) {
    return reports.map(report => this.toResponse(report));
  }

  static toPaginatedResponse(result) {
    return {
      reports: this.toListResponse(result.reports),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  static toSummaryResponse(report) {
    if (!report) return null;

    return {
      id: report.id,
      title: report.title,
      type: report.type,
      format: report.format,
      status: report.status,
      fileName: report.fileName,
      fileSize: report.getFileSizeFormatted(),
      createdAt: report.createdAt,
      completedAt: report.completedAt,
      isCompleted: report.isCompleted(),
      downloadUrl: report.downloadUrl
    };
  }

  static toStatisticsResponse(statistics) {
    return {
      total: statistics.total || 0,
      byStatus: statistics.byStatus || {},
      byType: statistics.byType || {},
      byCategory: statistics.byCategory || {},
      byFormat: statistics.byFormat || {},
      totalDownloads: statistics.totalDownloads || 0,
      totalViews: statistics.totalViews || 0,
      totalFileSize: statistics.totalFileSize || 0,
      totalFileSizeMB: statistics.totalFileSize
        ? (statistics.totalFileSize / 1024 / 1024).toFixed(2)
        : '0'
    };
  }
}

module.exports = ReportDTO;
