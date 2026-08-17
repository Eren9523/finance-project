const fs = require('fs');

const mockDataFile = fs.readFileSync('src/data/mock.ts', 'utf8');
// This is somewhat tricky, let's just use a basic set of models to seed the JSON file directly.

const DB_PATH = './db/database.json';
let db = {};
if (fs.existsSync(DB_PATH)) {
    db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

if (!db.models || db.models.length === 0) {
    db.models = [
        {
            "id": "m_001",
            "name": "消费贷授信未用信促提模型",
            "category": "营销",
            "scenarios": ["营销"],
            "capabilities": ["数据分析"],
            "status": "Approved"
        },
        {
            "id": "m_002",
            "name": "财富客户流失预警模型",
            "category": "风控",
            "scenarios": ["风控"],
            "capabilities": ["风险预测"],
            "status": "Approved"
        },
        {
            "id": "m_003",
            "name": "企业信贷欺诈识别模型",
            "category": "风控",
            "scenarios": ["风控"],
            "capabilities": ["欺诈检测"],
            "status": "Needs Review"
        },
        {
            "id": "m_004",
            "name": "大额资金异动监测模型",
            "category": "合规",
            "scenarios": ["合规"],
            "capabilities": ["监控"],
            "status": "Approved"
        },
        {
            "id": "m_005",
            "name": "智能客服知识推荐模型",
            "category": "服务",
            "scenarios": ["客服"],
            "capabilities": ["语义搜索"],
            "status": "Conflict"
        },
        {
            "id": "m_006",
            "name": "新客理财产品推荐模型",
            "category": "营销",
            "scenarios": ["营销"],
            "capabilities": ["推荐"],
            "status": "Approved"
        }
    ];
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    console.log("Seeded database with models.");
} else {
    console.log("Database already has models.");
}
