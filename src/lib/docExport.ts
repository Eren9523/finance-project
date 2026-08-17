import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  ShadingType,
  AlignmentType
} from 'docx';
import { saveAs } from 'file-saver';
import { ParsedRequirement, SingleRecommendation, CombinedRecommendation } from '../types';

export interface ReportExportData {
  title?: string;
  domain?: string;
  generatedAt?: string;
  parseResult?: ParsedRequirement;
  singleRecs?: SingleRecommendation[];
  combinedRec?: CombinedRecommendation;
  summaryNote?: string;
  riskNote?: string;
}

export async function exportToWord(
  data: ReportExportData, 
  filename: string = '业务模型智能推荐综合报告.docx'
): Promise<void> {
  const parseResult = data.parseResult;
  const primaryModel = data.singleRecs?.[0];
  const combinedRec = data.combinedRec;

  // Radar dimensions data
  const radarItems = primaryModel?.radarData || [
    { subject: '场景契合', A: 96, fullMark: 100 },
    { subject: '数据满足', A: 92, fullMark: 100 },
    { subject: '预测精度', A: 95, fullMark: 100 },
    { subject: '合规易用', A: 90, fullMark: 100 },
    { subject: '部署集成', A: 88, fullMark: 100 },
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header / Title
          new Paragraph({
            text: data.title || '业务模型智能推荐综合报告',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '需求领域', bold: true })] })],
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' },
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: data.domain || parseResult?.domain || '金融风控 / 农户小额贷款贷前准入' })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '生成时间', bold: true })] })],
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' },
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: data.generatedAt || new Date().toLocaleDateString() })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // 1. 业务需求解析摘要
          new Paragraph({
            text: '一、 业务需求解析摘要',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '核心客群', bold: true })] })],
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                    width: { size: 20, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: Array.isArray(parseResult?.audience)
                          ? parseResult.audience.join(', ')
                          : parseResult?.audience || '风控审批团队、三农金融事业部、信贷管理部门',
                      }),
                    ],
                    width: { size: 80, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '业务阶段', bold: true })] })],
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: parseResult?.stage || '贷前准入与风险评估' })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '核心能力诉求', bold: true })] })],
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: Array.isArray(parseResult?.coreCapabilities)
                          ? parseResult.coreCapabilities.join('、')
                          : parseResult?.coreCapabilities || '农户信用评估、反欺诈识别、经营能力分析、违约概率预测',
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '预期指标输出', bold: true })] })],
                    shading: { fill: 'F8FAFC', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: parseResult?.expectedOutput || '农户贷前准入评分、风险等级、建议额度与利率，以及是否准入的决策建议',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // 2. 主推单模型方案与五维度适配评估
          new Paragraph({
            text: '二、 主推单模型方案与五维度适配评估',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '推荐模型：', bold: true }),
              new TextRun({
                text: primaryModel?.model?.name || '个人经营贷与小微企业准入模型 (m_003)',
                bold: true,
                color: '1E40AF',
              }),
              new TextRun({ text: `  (综合匹配度: ${primaryModel?.matchScore || 95}%)` }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: primaryModel?.model?.description || '专门针对个人经营贷及小微企业准入与反欺诈，可直接适配农户小额贷款的经营性贷款特点。',
            spacing: { after: 150 },
          }),

          // 5-Dimension Radar Score Table
          new Paragraph({
            children: [new TextRun({ text: '【五维度模型契合度评估明细】', bold: true })],
            spacing: { after: 100 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '评估维度', bold: true })] })],
                    shading: { fill: '2563EB', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '匹配得分', bold: true })] })],
                    shading: { fill: '2563EB', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '维度评级与评估说明', bold: true })] })],
                    shading: { fill: '2563EB', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                ],
              }),
              ...radarItems.map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: item.subject, bold: true })] })],
                        shading: { fill: 'EFF6FF', type: ShadingType.CLEAR, color: 'auto' },
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: `${item.A} / 100` })],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text:
                              item.subject === '场景契合'
                                ? '高度适配三农与小微经营贷业务特征，具备完善的贷前准入逻辑'
                                : item.subject === '数据满足'
                                ? '覆盖征信、流水、发票及农业经营多源数据特征'
                                : item.subject === '预测精度'
                                ? 'AUC达0.88+，KS值保持在0.42以上，区分度极佳'
                                : item.subject === '合规易用'
                                ? '完全符合行内风控合规要求，提供特征贡献可解释性报告'
                                : '支持离线/实时API快速部署，微服务无缝对接',
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 150 } }),

          // Match Reasons
          new Paragraph({
            children: [new TextRun({ text: '推荐依据与业务亮点：', bold: true })],
            spacing: { after: 100 },
          }),
          ...(primaryModel?.matchReasons || [
            '专门针对个人经营贷及小微企业准入与反欺诈，直接适配农户小额贷款特点',
            '涵盖多层级规则与反欺诈逻辑，保障贷前安全',
            '已在多个县域支行落地应用，验证效果良好，坏账率降低 28%',
          ]).map(
            (reason) =>
              new Paragraph({
                text: `• ${reason}`,
                spacing: { after: 50 },
              })
          ),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // 3. 全链路组合推荐与流程架构
          new Paragraph({
            text: '三、 全链路组合推荐与流程架构',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: '组合方案名称：', bold: true }),
              new TextRun({
                text: combinedRec?.name || '农户小额贷款贷前准入风控组合方案',
                bold: true,
                color: '1E40AF',
              }),
            ],
            spacing: { after: 100 },
          }),

          new Paragraph({
            text:
              combinedRec?.overallExplanation ||
              '该方案通过m_005解析农户经营流水和财务数据，m_003进行准入和反欺诈初筛，m_004评估违约概率，形成多层风控体系，同时保证可解释性和效率。',
            spacing: { after: 150 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '节点', bold: true })] })],
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '流程环节角色', bold: true })] })],
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '对应模型组件', bold: true })] })],
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '预期业务价值', bold: true })] })],
                    shading: { fill: 'F1F5F9', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                ],
              }),
              ...(combinedRec?.nodes || [
                {
                  id: 'n1',
                  roleInFlow: '数据解析层',
                  model: { name: '企业财报与流水智能解析模型 (m_005)' },
                  expectedValue: '实现高效业务智能化处理，自动化提取经营收入与现金流特征',
                },
                {
                  id: 'n2',
                  roleInFlow: '准入与反欺诈层',
                  model: { name: '个人经营贷与小微企业准入模型 (m_003)' },
                  expectedValue: '秒级拦截高风险欺诈件与黑名单客户',
                },
                {
                  id: 'n3',
                  roleInFlow: '风险量化与定价层',
                  model: { name: '零售客户违约概率预警模型 (m_004)' },
                  expectedValue: '精准核定授信额度与差异化利率定价',
                },
              ]).map(
                (node, idx) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ text: `0${idx + 1}` })] }),
                      new TableCell({ children: [new Paragraph({ text: node.roleInFlow })] }),
                      new TableCell({ children: [new Paragraph({ text: node.model.name })] }),
                      new TableCell({ children: [new Paragraph({ text: node.expectedValue })] }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // 4. 风险提示与合规建议
          new Paragraph({
            text: '四、 风险提示与合规部署建议',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 },
          }),

          new Paragraph({
            text: '1. 需关注经营流水真实性及外部工商司法数据补全，建议设置动态授信复核期。',
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '2. 拦截阈值设定需兼顾拦截率与良好农户交易误伤率，建议按月动态微调评分卡。',
            spacing: { after: 50 },
          }),
          new Paragraph({
            text: '3. 所有模型调用的输入与评分结论均已开启全链路日志落盘，满足银保监审计合规要求。',
            spacing: { after: 150 },
          }),

          new Paragraph({
            text: '— 报告结束 —',
            alignment: AlignmentType.CENTER,
            spacing: { before: 300 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
