const { PrismaClient, Tier } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function main() {
  await prisma.forecast.deleteMany();
  await prisma.query.deleteMany();
  await prisma.user.deleteMany();

  const seedUsers = [
    {
      name: 'Alice Example',
      email: 'alice@example.com',
      password: 'Password123!',
      tier: Tier.PRO,
      queries: [
        {
          prompt: 'What are the expected macroeconomic trends for Q1 2025?',
          variables: {
            region: 'North America',
            indicators: ['GDP', 'inflation', 'employment']
          },
          result: {
            gdpGrowth: 2.4,
            inflation: 3.1,
            employmentOutlook: 'steady'
          },
          forecasts: [
            {
              summary: 'Moderate growth with soft landing scenario',
              projections: {
                probability: 0.65,
                downsideRisk: 0.2,
                upsidePotential: 0.15
              }
            }
          ]
        },
        {
          prompt: 'How will energy prices evolve over the next 6 months?',
          variables: {
            commodities: ['oil', 'natural_gas'],
            timeframeMonths: 6
          },
          result: {
            oilPriceRange: [70, 85],
            naturalGasPrice: {
              percentile50: 3.1,
              percentile90: 4.2
            }
          },
          forecasts: [
            {
              summary: 'Seasonal uptick driven by supply constraints',
              projections: {
                confidence: 'medium',
                drivers: ['OPEC policy', 'winter demand']
              }
            }
          ]
        }
      ]
    },
    {
      name: 'Brian Forecaster',
      email: 'brian@example.com',
      password: 'Password123!',
      tier: Tier.FREE,
      queries: [
        {
          prompt: 'Assess the competitive landscape for AI startups in Europe.',
          variables: {
            sectors: ['healthcare', 'finance', 'manufacturing'],
            horizon: '12_months'
          },
          result: {
            healthcare: 'high growth',
            finance: 'moderate growth',
            manufacturing: 'emerging opportunities'
          },
          forecasts: [
            {
              summary: 'Healthcare AI to capture 40% market share growth',
              projections: {
                probability: 0.55,
                notes: 'Driven by regulatory approvals and investment inflows.'
              }
            }
          ]
        }
      ]
    },
    {
      name: 'Chloe Strategist',
      email: 'chloe@example.com',
      password: 'Password123!',
      tier: Tier.ENTERPRISE,
      queries: [
        {
          prompt: 'Model supply chain resilience for semiconductor components.',
          variables: {
            suppliers: 12,
            regions: ['APAC', 'NA'],
            mitigationStrategies: ['dual_sourcing', 'inventory_buffer']
          },
          result: {
            riskScore: 0.32,
            mitigationImpact: 'Inventory buffers reduce risk by 18%'
          },
          forecasts: [
            {
              summary: 'Risk stabilises with incremental diversification',
              projections: {
                probability: 0.72,
                residualRisk: 0.28
              }
            },
            {
              summary: 'Geopolitical escalation scenario',
              projections: {
                probability: 0.18,
                mitigationPlans: ['emergency stockpile', 'alternate suppliers']
              }
            }
          ]
        }
      ]
    }
  ];

  for (const user of seedUsers) {
    const passwordHash = await hashPassword(user.password);

    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        passwordHash,
        tier: user.tier,
        queries: {
          create: user.queries.map((query) => ({
            prompt: query.prompt,
            variables: query.variables,
            result: query.result,
            forecasts: {
              create: query.forecasts.map((forecast) => ({
                summary: forecast.summary,
                projections: forecast.projections
              }))
            }
          }))
        }
      }
    });
  }

  console.log('Database has been seeded with sample users, queries, and forecasts.');
}

main()
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
