import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Globe2,
  CheckCircle2,
} from "lucide-react";
import PublicHeader from "../components/PublicHeader";

const Home = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* --- HEADER / NAVBAR --- */}
      <PublicHeader />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Nền tảng tài chính 4.0
              </div>

              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900">
                Quản trị dòng tiền <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-cyan-500">
                  Hiệu quả & Tối ưu
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                FinReports giúp doanh nghiệp của bạn kiểm soát tài chính, tự
                động hóa báo cáo và dự báo dòng tiền bằng công nghệ AI tiên tiến
                nhất.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex justify-center items-center px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Bắt đầu ngay <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button className="inline-flex justify-center items-center px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
                  Xem Demo
                </button>
              </div>

              <div className="pt-4 flex items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs overflow-hidden`}
                    >
                      <img
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="user"
                      />
                    </div>
                  ))}
                </div>
                <p>Tin dùng bởi 10,000+ CEO</p>
              </div>
            </div>

            {/* Right Image/Visual */}
            <div className="lg:w-1/2 relative">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
              <div className="relative rounded-2xl bg-slate-900 p-2 shadow-2xl border border-slate-800 rotate-1 hover:rotate-0 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                  alt="Dashboard Preview"
                  className="rounded-xl opacity-90"
                />

                {/* Floating Card */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">
                      Lợi nhuận ròng
                    </p>
                    <p className="text-xl font-bold text-slate-900">+34.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-10 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Giao dịch / giây", value: "50k+" },
            { label: "Tổng tài sản", value: "$2B+" },
            { label: "Quốc gia", value: "120+" },
            { label: "Uptime", value: "99.99%" },
          ].map((stat, idx) => (
            <div key={idx}>
              <p className="text-3xl font-extrabold text-slate-900 mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Mọi thứ bạn cần để phát triển
            </h2>
            <p className="text-slate-600">
              Hệ thống của chúng tôi cung cấp các công cụ mạnh mẽ nhất để bạn
              quản lý tài chính mà không cần kiến thức kế toán chuyên sâu.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Phân tích thời gian thực
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Theo dõi biến động dòng tiền ngay lập tức với các biểu đồ trực
                quan và báo cáo tự động cập nhật từng giây.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Bảo mật cấp ngân hàng
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Dữ liệu của bạn được mã hóa 256-bit chuẩn AES. Chúng tôi tuân
                thủ các tiêu chuẩn bảo mật khắt khe nhất.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 transition-transform">
                <Globe2 />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Thanh toán toàn cầu
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Hỗ trợ đa tiền tệ và cổng thanh toán quốc tế, giúp doanh nghiệp
                của bạn vươn ra biển lớn dễ dàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 font-bold text-xl text-white mb-4">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">
                FR
              </div>
              FinReports
            </div>
            <p className="text-sm max-w-xs">
              Đồng hành cùng sự thịnh vượng của doanh nghiệp Việt. Giải pháp tài
              chính số 1 thị trường.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Báo cáo thuế
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Quản lý nhân sự
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Công ty</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs">
          © 2024 FinReports. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
