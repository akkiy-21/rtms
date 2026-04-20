export const getOperationRateColor = (rate: number) => {
    if (rate >= 95) return 'limegreen';
    if (rate >= 85) return 'yellow';
    return 'red';
  };
  
  export const getStatusColor = (category: string) => {
    switch (category) {
      case '操業時間':
        return '#00FF00';
      case '性能ロス時間':
        return '#FF0000';
      case '停止ロス時間':
        return '#FFFF00';
      case '計画停止時間':
        return '#0000FF';
      default:
        return '#FFFFFF';
    }
  };