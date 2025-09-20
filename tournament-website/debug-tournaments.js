// Debug script to test authentication and tournament data
// Add this to the browser console when testing

console.log('🔍 DEBUGGING TOURNAMENT DATA')

// 1. Check if user is authenticated
supabase.auth.getUser().then(result => {
  console.log('👤 Current user:', result.data.user?.id)
  console.log('📧 Email:', result.data.user?.email)
  
  if (!result.data.user) {
    console.log('❌ User not authenticated - this is why you see fallback data')
    return
  }
  
  const userId = result.data.user.id
  
  // 2. Check tournament participants table
  console.log('🔍 Checking tournament_participants table...')
  supabase
    .from('tournament_participants')
    .select('*')
    .eq('user_id', userId)
    .then(result => {
      console.log('📊 Your tournament participations:', result.data)
      console.log('📊 Count:', result.data?.length || 0)
      
      if (result.error) {
        console.error('❌ Error:', result.error)
      }
      
      if (!result.data?.length) {
        console.log('ℹ️ You have not joined any tournaments yet')
        console.log('ℹ️ This is why the page shows "No tournaments joined" or fallback data')
      }
    })
    
  // 3. Check available tournaments
  console.log('🔍 Checking available tournaments...')
  supabase
    .from('tournaments')
    .select('*')
    .limit(5)
    .then(result => {
      console.log('🏆 Available tournaments:', result.data)
      console.log('🏆 Count:', result.data?.length || 0)
      
      if (result.error) {
        console.error('❌ Error:', result.error)
      }
    })
})