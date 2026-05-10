import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // <-- Đã import Theme hệ thống
import { useLanguage } from "../context/LanguageContext"; // <-- Đã import Language hệ thống
import {
  User,
  Mail,
  Target,
  Calendar,
  Edit,
  Award,
  Zap,
  Trophy,
  ShieldCheck,
  Settings,
  Users,
  Globe,
  Bot,
  Lock,
  Bell,
  Save,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

export function Profile() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // LẤY MÀU VÀ STATE TỪ GLOBAL HỆ THỐNG
  const { theme, toggleTheme, colors } = useTheme();
  const isDark = theme === "dark";
  // 2LÔI NGÔN NGỮ TỪ GLOBAL RA, XÓA LUÔN useState("vi") CỦA MÀY ĐI
  const { language, setLanguage, t } = useLanguage();
  // State cho phần Cài đặt (Đã xóa state theme cục bộ)
  const [aiTone, setAiTone] = useState("friendly");
  const [notifications, setNotifications] = useState(true);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });

  const handleSaveSettings = () => {
    console.log("Đã lưu cài đặt:", {
      theme,
      language,
      aiTone,
      notifications,
      passwords,
    });
    alert(t("profile.savedSuccess"));
  };

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        minHeight: "100vh",
        color: colors.text,
        padding: "40px",
        fontFamily: "sans-serif",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        {/* ================= PHẦN 1: HỒ SƠ ================= */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
            }}
          >
            <h1 style={{ fontSize: "28px", fontWeight: 800, margin: 0 }}>
              {/* Bao bọc toàn bộ nội dung trong một span duy nhất để áp dụng một màu */}
              <span
                style={{ color: isAdmin ? colors.secondary : colors.primary }}
              >
                {t("profile.title")}{" "}
                {isAdmin ? t("profile.admin") : t("profile.personal")}
              </span>
            </h1>
            <button
              style={{
                backgroundColor: isAdmin ? colors.secondary : colors.primary,
                color: isDark ? colors.bg : "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "10px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Edit size={18} /> {t("common.edit")}
            </button>
          </div>

          <div
            style={{
              backgroundColor: colors.card,
              borderRadius: "24px",
              padding: "35px",
              border: `1px solid ${isAdmin ? colors.secondary : colors.primary}`,
              marginBottom: "25px",
              display: "flex",
              gap: "30px",
              alignItems: "center",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src={
                  user?.avatar ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                }
                alt={user?.name}
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "25px",
                  border: `3px solid ${isAdmin ? colors.secondary : colors.primary}`,
                  padding: "4px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-8px",
                  right: "-8px",
                  backgroundColor: isAdmin ? colors.secondary : colors.primary,
                  padding: "6px",
                  borderRadius: "10px",
                }}
              >
                {isAdmin ? (
                  <Settings size={18} color="#fff" />
                ) : (
                  <ShieldCheck size={18} color="#fff" />
                )}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <h2 style={{ fontSize: "30px", fontWeight: 900, margin: 0 }}>
                  {user?.name}
                </h2>
                {/* {isAdmin && (
                  <span
                    style={{
                      fontSize: "11px",
                      backgroundColor: isDark
                        ? "rgba(168, 85, 247, 0.2)"
                        : "rgba(126, 34, 206, 0.1)",
                      color: colors.secondary,
                      padding: "3px 10px",
                      borderRadius: "20px",
                      border: `1px solid ${colors.secondary}`,
                    }}
                  >
                  </span>
                )} */}
              </div>
              <p
                style={{
                  color: isAdmin ? colors.secondary : colors.primary,
                  fontWeight: 500,
                  margin: "5px 0 0 0",
                }}
              >
                {isAdmin ? t("profile.roleAdmin") : t("profile.roleStudent")}
              </p>

              {!isAdmin && (
                <div
                  style={{ display: "flex", gap: "15px", marginTop: "18px" }}
                >
                  <div
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.03)",
                      padding: "8px 16px",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "10px", color: colors.muted }}>
                      LEVEL
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: colors.primary,
                      }}
                    >
                      {user?.level || 1}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.03)",
                      padding: "8px 16px",
                      borderRadius: "12px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "10px", color: colors.muted }}>
                      KINH NGHIỆM
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: colors.secondary,
                      }}
                    >
                      {user?.xp || 0} XP
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isAdmin ? "1fr" : "1fr 1fr",
              gap: "25px",
            }}
          >
            <div
              style={{
                backgroundColor: colors.card,
                padding: "25px",
                borderRadius: "20px",
                border: `1px solid ${colors.border}`,
                transition: "all 0.3s ease",
              }}
            >
              <h3
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  margin: "0 0 20px 0",
                  fontSize: "17px",
                  color: isAdmin ? colors.secondary : colors.primary,
                }}
              >
                <Mail size={18} /> {t("profile.contactInfo")}
              </h3>
              <div style={{ fontSize: "13px", color: colors.muted }}>
                {t("profile.loginEmail")}
              </div>
              <div
                style={{ fontSize: "16px", fontWeight: 500, marginTop: "5px" }}
              >
                {user?.email}
              </div>

              {isAdmin && (
                <>
                  <hr
                    style={{
                      border: "none",
                      borderTop: `1px solid ${colors.divider}`,
                      margin: "20px 0",
                    }}
                  />
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      margin: "0 0 20px 0",
                      fontSize: "17px",
                      color: colors.secondary,
                    }}
                  >
                    <Users size={18} /> {t("profile.adminRights")}{" "}
                  </h3>
                  <ul
                    style={{
                      color: colors.muted,
                      fontSize: "14px",
                      paddingLeft: "20px",
                    }}
                  >
                    <li>{t("profile.rights.manageUsers")}</li>
                    <li>{t("profile.rights.viewReports")}</li>
                    <li>{t("profile.rights.manageContent")}</li>
                  </ul>
                </>
              )}
            </div>

            {!isAdmin && (
              <div
                style={{
                  backgroundColor: colors.card,
                  padding: "25px",
                  borderRadius: "20px",
                  border: `1px solid ${colors.border}`,
                  transition: "all 0.3s ease",
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: "0 0 20px 0",
                    fontSize: "17px",
                    color: colors.primary,
                  }}
                >
                  <Trophy size={18} /> {t("profile.skills")}{" "}
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px",
                  }}
                >
                  {user?.skillProfile &&
                    Object.entries(user.skillProfile).map(([skill, value]) => (
                      <div key={skill}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "6px",
                            fontSize: "12px",
                          }}
                        >
                          <span style={{ textTransform: "uppercase" }}>
                            {skill}
                          </span>
                          <span
                            style={{
                              color: colors.primary,
                              fontWeight: "bold",
                            }}
                          >
                            {value as number}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            backgroundColor: colors.divider,
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${value}%`,
                              height: "100%",
                              backgroundColor: colors.primary,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ĐƯỜNG PHÂN CÁCH */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{ flex: 1, height: "1px", backgroundColor: colors.border }}
          ></div>
          <div
            style={{
              fontSize: "14px",
              color: colors.muted,
              fontWeight: "bold",
              letterSpacing: "2px",
            }}
          >
            {t("profile.settings")}
          </div>
          <div
            style={{ flex: 1, height: "1px", backgroundColor: colors.border }}
          ></div>
        </div>

        {/* ================= PHẦN 2: CÀI ĐẶT HỆ THỐNG ================= */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: 800, margin: 0 }}>
              {t("profile.settings")}
            </h2>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "25px" }}
          >
            {/* HÀNG 1: CÀI ĐẶT CHUNG (TRÁI) & BẢO MẬT (PHẢI) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
                alignItems: "stretch",
              }}
            >
              {/* CỘT TRÁI: Giao diện, Ngôn ngữ & AI */}
              <div
                style={{
                  backgroundColor: colors.card,
                  padding: "25px",
                  borderRadius: "20px",
                  border: `1px solid ${colors.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "25px",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Phần Giao diện (Theme) */}
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      margin: "0 0 15px 0",
                      fontSize: "17px",
                      color: colors.primary,
                    }}
                  >
                    <Monitor size={18} /> {t("profile.appearance")}{" "}
                  </h3>

                  {/* Nút Toggle Chế độ Sáng/Tối - Đã gọi toggleTheme thay vì setTheme */}
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      backgroundColor: colors.inputBg,
                      padding: "5px",
                      borderRadius: "12px",
                      border: `1px solid ${colors.inputBorder}`,
                    }}
                  >
                    <button
                      onClick={() => toggleTheme("dark")}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: isDark ? colors.card : "transparent",
                        color: isDark ? colors.primary : colors.muted,
                        fontWeight: isDark ? "bold" : "normal",
                        transition: "all 0.2s",
                      }}
                    >
                      <Moon size={16} /> {t("profile.theme.dark")}
                    </button>
                    <button
                      onClick={() => toggleTheme("light")}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: !isDark ? colors.card : "transparent",
                        color: !isDark ? colors.primary : colors.muted,
                        fontWeight: !isDark ? "bold" : "normal",
                        transition: "all 0.2s",
                        boxShadow: !isDark
                          ? "0 2px 5px rgba(0,0,0,0.05)"
                          : "none",
                      }}
                    >
                      <Sun size={16} /> {t("profile.theme.light")}
                    </button>
                  </div>
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: `1px solid ${colors.divider}`,
                    margin: "0",
                  }}
                />

                {/* Phần Ngôn ngữ */}
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: colors.muted,
                      marginBottom: "8px",
                    }}
                  >
                    {t("profile.languageLabel")}{" "}
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as "vi" | "en")}
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      color: colors.text,
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                    }}
                  >
                    <option value="vi">{t("profile.language.vi")}</option>
                    <option value="en">{t("profile.language.en")}</option>
                  </select>
                </div>

                <hr
                  style={{
                    border: "none",
                    borderTop: `1px solid ${colors.divider}`,
                    margin: "0",
                  }}
                />

                {/* Phần AI Tone */}
                <div>
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      margin: "0 0 15px 0",
                      fontSize: "17px",
                      color: colors.secondary,
                    }}
                  >
                    <Bot size={18} /> {t("profile.aiTone")}
                  </h3>
                  <div
                    style={{
                      fontSize: "13px",
                      color: colors.muted,
                      marginBottom: "8px",
                    }}
                  >
                    {t("profile.aiTone.description")}
                  </div>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      color: colors.text,
                      outline: "none",
                      cursor: "pointer",
                      appearance: "none",
                    }}
                  >
                    <option value="friendly">
                      {t("profile.aiTones.friendly")}
                    </option>
                    <option value="professional">
                      {t("profile.aiTones.professional")}
                    </option>
                    <option value="concise">
                      {t("profile.aiTones.concise")}
                    </option>
                  </select>
                </div>
              </div>

              {/* CỘT PHẢI: Bảo mật tài khoản */}
              <div
                style={{
                  backgroundColor: colors.card,
                  padding: "25px",
                  borderRadius: "20px",
                  border: `1px solid ${colors.border}`,
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease",
                }}
              >
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: "0 0 20px 0",
                    fontSize: "17px",
                    color: colors.primary,
                  }}
                >
                  <Lock size={18} /> {t("profile.accountSecurity")}{" "}
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <input
                    type="password"
                    placeholder={t("profile.currentPassword")}
                    value={passwords.old}
                    onChange={(e) =>
                      setPasswords({ ...passwords, old: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      color: colors.text,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="password"
                    placeholder={t("profile.newPassword")}
                    value={passwords.new}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      color: colors.text,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <input
                    type="password"
                    placeholder={t("profile.confirmNewPassword")}
                    value={passwords.confirm}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.inputBorder}`,
                      color: colors.text,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* HÀNG 2: THÔNG BÁO */}
            <div
              style={{
                backgroundColor: colors.card,
                padding: "20px 25px",
                borderRadius: "20px",
                border: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
              }}
            >
              <div>
                <h3
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    margin: "0 0 5px 0",
                    fontSize: "17px",
                    color: colors.secondary,
                  }}
                >
                  <Bell size={18} /> {t("profile.notificationTitle")}
                </h3>
                <div style={{ fontSize: "13px", color: colors.muted }}>
                  {t("profile.notificationDesc")}
                </div>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  backgroundColor: colors.inputBg,
                  padding: "12px 20px",
                  borderRadius: "10px",
                  border: `1px solid ${colors.divider}`,
                }}
              >
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  style={{
                    width: "18px",
                    height: "18px",
                    accentColor: colors.primary,
                    cursor: "pointer",
                  }}
                />{" "}
                {t("profile.enableEmail")}
              </label>
            </div>

            {/* HÀNG 3: NÚT LƯU */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "10px",
              }}
            >
              <button
                onClick={handleSaveSettings}
                style={{
                  padding: "15px 40px",
                  borderRadius: "12px",
                  background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                  color: "#fff",
                  border: "none",
                  fontWeight: 900,
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  boxShadow: `0 10px 20px -10px ${colors.primary}`,
                }}
              >
                <Save size={20} /> {t("profile.saveSettings")}{" "}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
