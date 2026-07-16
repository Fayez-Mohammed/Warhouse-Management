use std::path::PathBuf;
use std::process::Command;

// 1. استيراد مكتبة التحكم في عمليات الويندوز
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_log::Builder::default().build())
    .setup(|_app| {
      println!("==============================");
      println!("Starting Base.API Dynamically and Silently...");

      // تحديد مسار الـ API ديناميكياً
      let exe_path: PathBuf = if cfg!(debug_assertions) {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
          .join("bin")
          .join("Base.API-x86_64-pc-windows-msvc.exe")
      } else {
        std::env::current_exe()
          .expect("Failed to get current exe path")
          .parent()
          .expect("Failed to get parent directory")
          .join("bin")
          .join("Base.API-x86_64-pc-windows-msvc.exe") // استخدم الاسم الذي نجح معك في مجلد العميل
      };

      let working_dir = exe_path.parent().expect("Cannot determine executable directory");

      if exe_path.exists() {
        let mut cmd = Command::new(&exe_path);
        cmd.current_dir(working_dir);

        // 2. السطر السحري: إخفاء نافذة الـ Console تماماً على الويندوز
        #[cfg(target_os = "windows")]
        {
          const CREATE_NO_WINDOW: u32 = 0x08000000; // Flag لمنع إنشاء نافذة واجهة مستخدم للعملية
          cmd.creation_flags(CREATE_NO_WINDOW);
        }

        // تشغيل الـ API في الخلفية
        match cmd.spawn() {
          Ok(_) => {
            println!("✅ Base.API started silently in the background.");
          }
          Err(err) => {
            println!("❌ Failed to start Base.API");
            println!("{:?}", err);
          }
        }
      } else {
        println!("❌ API Executable not found at expected path!");
      }

      println!("==============================");
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}