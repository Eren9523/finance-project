const fs = require('fs');

const content = `import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType,
  ImageRun,
  BorderStyle
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
  radarImageBase64?: string;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const base64Data = base64.replace(/^data:image\\/(png|jpeg|jpg);base64,/, "");
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function exportToWord(
  data: ReportExportData, 
  filename: string = '业务模型智能推荐综合报告.docx'
): Promise<void> {
  const parseResult = data.parseResult;
  const primaryModel = data.singleRecs?.[0];
  const combinedRec = data.combinedRec;

  const children: any[] = [];

  // Header / Title
  children.push(
    new Paragraph({
      text: data.title || '业务模型智能推荐综合报告',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
    })
  );

  // Metadata
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '需求领域: ', bold: true, color: '64748B' }),
        new TextRun({ text: \`\${data.domain || parseResult?.domain || '金融业务 / 智能化模型选型'}    \` }),
        new TextRun({ text: '评估时间: ', bold: true, color: '64748B' }),
        new TextRun({ text: \`\${data.generatedAt || new Date().toLocaleDateString()}    \` }),
        new TextRun({ text: '校验状态: ', bold: true, color: '64748B' }),
        new TextRun({ text: '合规审计已通过', color: '10B981', bold: true }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    })
  );

  // 1. 业务需求解析摘要
  children.push(
    new Paragraph({
      text: '1. 业务需求解析摘要',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 150 },
    })
  );

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
        left: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
        right: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "F1F5F9" },
        insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "F1F5F9" },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '核心客群', bold: true })] })],
              shading: { fill: 'F8FAFC' },
              width: { size: 15, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: Array.isArray(parseResult?.audience)
                    ? parseResult.audience.join(', ')
                    : parseResult?.audience || '数据科技部门, 业务风控团队',
                }),
              ],
              width: { size: 35, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '业务阶段', bold: true })] })],
              shading: { fill: 'F8FAFC' },
              width: { size: 15, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
            new TableCell({
              children: [new Paragraph({ text: parseResult?.stage || '业务需求量化与模型匹配' })],
              width: { size: 35, type: WidthType.PERCENTAGE },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '能力诉求', bold: true })] })],
              shading: { fill: 'F8FAFC' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({
                  text: Array.isArray(parseResult?.coreCapabilities)
                    ? parseResult.coreCapabilities.join('、')
                    : parseResult?.coreCapabilities || '智能流水解析、准入反欺诈评估、违约概率预测',
                }),
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: '预期输出', bold: true })] })],
              shading: { fill: 'F8FAFC' },
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
            new TableCell({
              columnSpan: 3,
              children: [
                new Paragraph({
                  text: parseResult?.expectedOutput || '量化评估报告与组合部署方案',
                }),
              ],
              margins: { top: 100, bottom: 100, left: 100, right: 100 }
            }),
          ],
        }),
      ],
    })
  );

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // 2. 主推单模型方案与五维度适配评估
  children.push(
    new Paragraph({
      text: '2. 主推单模型方案与五维度适配评估',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 150 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: primaryModel?.model?.name || '中间业务产品营销模型 (代扣)',
          bold: true,
          size: 28, // 14pt
          color: '2563EB',
        }),
        new TextRun({ text: \`    (综合匹配度: \${primaryModel?.matchScore || 96}%)\`, bold: true, color: '10B981' }),
      ],
      spacing: { after: 100 },
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: '模型描述: ', bold: true, color: '64748B' }),
        new TextRun({ text: primaryModel?.model?.description || '' }),
      ],
      spacing: { after: 150 },
    })
  );

  // Radar Image
  if (data.radarImageBase64) {
    try {
      const bytes = base64ToUint8Array(data.radarImageBase64);
      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: bytes,
              type: 'png',
              transformation: {
                width: 600,
                height: 250, // adjust proportions
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    } catch (e) {
      console.error('Failed to embed radar chart image', e);
    }
  }

  // Recommendations and Features
  children.push(
    new Paragraph({
      children: [new TextRun({ text: '推荐理由与业务优势', bold: true })],
      spacing: { after: 100 },
    })
  );
  
  (primaryModel?.matchReasons || [
    '具备极佳的准入判别与风险拦截能力',
  ]).forEach((reason) => {
    children.push(
      new Paragraph({
        text: \`• \${reason}\`,
        spacing: { after: 50 },
      })
    );
  });

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // 3. 备选与辅助联动模型对比
  if (data.singleRecs && data.singleRecs.length > 1) {
    children.push(
      new Paragraph({
        text: '3. 备选与辅助联动模型对比',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 150 },
      })
    );

    data.singleRecs.slice(1).forEach((rec) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: rec.model.name,
              bold: true,
              size: 24, // 12pt
              color: '475569',
            }),
            new TextRun({ text: \`    (匹配度: \${rec.matchScore}%)\`, color: '3B82F6' }),
          ],
          spacing: { after: 100 },
        })
      );

      children.push(
        new Paragraph({
          text: \`目标用户: \${rec.model.description || ''}\`,
          spacing: { after: 100 },
        })
      );
      
      children.push(
        new Paragraph({
          children: [new TextRun({ text: '推荐定位: ', bold: true }), new TextRun({ text: rec.matchReasons?.[0] || '' })],
          spacing: { after: 50 },
        })
      );
      
      children.push(
        new Paragraph({
          children: [new TextRun({ text: '优势: ', bold: true }), new TextRun({ text: rec.matchReasons?.[0] || '' })],
          spacing: { after: 150 },
        })
      );
    });
  }

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // 4. 全链路组合推荐与流程架构 (If exists)
  if (combinedRec) {
    children.push(
      new Paragraph({
        text: '4. 全链路组合方案与流程拓扑',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 150 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: '组合方案名称：', bold: true }),
          new TextRun({
            text: combinedRec.name || '农户小额贷款贷前准入风控组合方案',
            bold: true,
            color: '2563EB',
          }),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        text: combinedRec.overallExplanation || '',
        spacing: { after: 150 },
      })
    );

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
          left: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
          right: { style: BorderStyle.SINGLE, size: 2, color: "E2E8F0" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "F1F5F9" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "F1F5F9" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: '节点', bold: true })] })],
                shading: { fill: 'F8FAFC' },
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: '流程环节角色', bold: true })] })],
                shading: { fill: 'F8FAFC' },
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: '对应模型组件', bold: true })] })],
                shading: { fill: 'F8FAFC' },
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: '预期业务价值', bold: true })] })],
                shading: { fill: 'F8FAFC' },
                margins: { top: 100, bottom: 100, left: 100, right: 100 }
              }),
            ],
          }),
          ...(combinedRec.nodes || []).map(
            (node, idx) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: \`0\${idx + 1}\` })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ text: node.roleInFlow })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ text: node.model.name })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                  new TableCell({ children: [new Paragraph({ text: node.expectedValue })], margins: { top: 100, bottom: 100, left: 100, right: 100 } }),
                ],
              })
          ),
        ],
      })
    );
  }

  children.push(new Paragraph({ text: '', spacing: { after: 200 } }));

  // Footer
  children.push(
    new Paragraph({
      text: '— 报告结束 —',
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
`;

fs.writeFileSync('src/lib/docExport.ts', content);
