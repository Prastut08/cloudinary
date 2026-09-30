import fetch from 'node-fetch';

async function runTest() {
  console.log('--- STARTING LUMA VIDEO GENERATION TEST CASE ---');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5001/api/health');
  const healthData = await healthRes.json();
  console.log('1. Health check response:', healthData);

  // 2. Submit Luma AI video generation task
  console.log('2. Submitting test image-to-video generation task...');
  const genRes = await fetch('http://localhost:5001/api/luma/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test_token_12345',
    },
    body: JSON.stringify({
      imageUrl: 'https://res.cloudinary.com/dui8sz3hv/image/upload/v1/sample.jpg',
      prompt: 'Cinematic slow motion product reveal',
      aspectRatio: '16:9',
      duration: 5,
      title: 'Test Product Motion Video',
    }),
  });

  console.log('   HTTP Status:', genRes.status);
  const genData = await genRes.json();
  console.log('   Response Data:', JSON.stringify(genData, null, 2));

  if (!genRes.ok || !genData.success) {
    console.error('❌ Test failed during video task submission!');
    process.exit(1);
  }

  const taskId = genData.taskId;
  console.log('✅ Task submitted successfully. Task ID:', taskId);

  // 3. Check Task Status
  console.log('3. Checking task status...');
  const statusRes = await fetch(`http://localhost:5001/api/luma/task/${taskId}`, {
    headers: {
      'Authorization': 'Bearer test_token_12345',
    },
  });
  const statusData = await statusRes.json();
  console.log('   Task status:', statusData.data?.status);
  console.log('   Video URL:', statusData.data?.videoUrl);
  console.log('   API Note:', statusData.data?.apiNote);

  // 4. Check Luma History
  console.log('4. Checking video history...');
  const historyRes = await fetch('http://localhost:5001/api/luma/history', {
    headers: {
      'Authorization': 'Bearer test_token_12345',
    },
  });
  const historyData = await historyRes.json();
  console.log('   History count:', historyData.count);

  console.log('--- TEST CASE COMPLETED SUCCESSFULLY ✅ ---');
}

runTest().catch((err) => {
  console.error('❌ Error executing test:', err);
  process.exit(1);
});
