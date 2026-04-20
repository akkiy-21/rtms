import { QualityControlSignal } from "@/types/qualityControl";

/**
 * 階層構造の品質制御シグナルを平坦化してテーブル表示用に変換
 * @param signals 階層構造のシグナル配列
 * @param level 現在の階層レベル（デフォルト: 0）
 * @returns 平坦化されたシグナル配列（levelプロパティ付き）
 */
export const flattenQualityControlSignals = (
  signals: QualityControlSignal[], 
  level: number = 0
): (QualityControlSignal & { level: number })[] => {
  const result: (QualityControlSignal & { level: number })[] = [];

  signals.forEach(signal => {
    // 現在のシグナルを追加（levelプロパティを付与）
    result.push({ ...signal, level });

    // 子シグナルがある場合は再帰的に処理
    if (signal.children && signal.children.length > 0) {
      const childrenFlattened = flattenQualityControlSignals(signal.children, level + 1);
      result.push(...childrenFlattened);
    }
  });

  return result;
};

/**
 * 平坦化されたシグナル配列から階層構造を再構築
 * @param flatSignals 平坦化されたシグナル配列
 * @returns 階層構造のシグナル配列
 */
export const buildSignalHierarchy = (flatSignals: QualityControlSignal[]): QualityControlSignal[] => {
  const signalMap = new Map<number, QualityControlSignal>();
  const rootSignals: QualityControlSignal[] = [];

  // まず全てのシグナルをマップに格納
  flatSignals.forEach(signal => {
    signalMap.set(signal.id, { ...signal, children: [] });
  });

  // 親子関係を構築
  flatSignals.forEach(signal => {
    const currentSignal = signalMap.get(signal.id)!;
    
    if (signal.parent_id === null) {
      // ルートシグナル
      rootSignals.push(currentSignal);
    } else {
      // 子シグナル
      const parentSignal = signalMap.get(signal.parent_id);
      if (parentSignal) {
        parentSignal.children.push(currentSignal);
      }
    }
  });

  return rootSignals;
};