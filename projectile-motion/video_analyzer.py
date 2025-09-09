import cv2
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.widgets import Button, TextBox, CheckButtons
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import json
import os
import matplotlib.font_manager as fm
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

# 한글 폰트 설정
plt.rcParams['font.family'] = 'Malgun Gothic'
plt.rcParams['axes.unicode_minus'] = False
plt.rcParams['font.size'] = 10

class VideoAnalyzer:
    """
    비디오 분석기 클래스
    2차원 포물선 운동을 분석하기 위한 GUI 애플리케이션
    """
    def __init__(self):
        """
        초기화 메서드
        GUI 윈도우 생성 및 변수 초기화
        """
        self.root = tk.Tk()
        self.root.title("2차원 포물선 운동 비디오 분석")
        
        # 데이터 저장 변수
        self.video_path = None
        self.cap = None
        self.frame = None
        self.points = []  # [(frame_idx, x, y), ...]
        self.scale_factor = 1.0  # meters per pixel
        self.origin = None  # (x, y) in pixels
        self.tracking_mode = 'manual'  # 'manual' or 'auto'
        self.current_frame_idx = 0
        self.fps = 30
        self.calibration_length = 1.0  # 1 meter default
        self.frame_scale = 1.0  # 화면 표시 비율
        
        self.setup_gui()
        
    def setup_gui(self):
        """
        GUI 구성 요소를 생성하고 배치하는 메서드
        """
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 비디오 제어 프레임
        control_frame = ttk.LabelFrame(main_frame, text="비디오 제어", padding="5")
        control_frame.grid(row=0, column=0, padx=5, pady=5, sticky="ew")
        
        ttk.Button(control_frame, text="비디오 열기", command=self.load_video).grid(row=0, column=0, padx=5)
        ttk.Button(control_frame, text="보정 도구", command=self.show_calibration_tool).grid(row=0, column=1, padx=5)
        ttk.Button(control_frame, text="좌표계 설정", command=self.set_coordinate_system).grid(row=0, column=2, padx=5)
        
        # 실시간 분석 버튼 추가
        ttk.Button(control_frame, text="실시간 분석 시작", command=self.start_realtime_analysis).grid(row=0, column=7, padx=5)
        
        # 비디오 크기 조절
        ttk.Label(control_frame, text="화면 크기:").grid(row=0, column=3, padx=5)
        self.scale_var = tk.StringVar(value="100")
        scale_entry = ttk.Entry(control_frame, textvariable=self.scale_var, width=5)
        scale_entry.grid(row=0, column=4, padx=2)
        ttk.Label(control_frame, text="%").grid(row=0, column=5)
        ttk.Button(control_frame, text="적용", command=self.apply_scale).grid(row=0, column=6, padx=5)
        
        # 추적 모드 선택
        tracking_frame = ttk.LabelFrame(main_frame, text="추적 모드", padding="5")
        tracking_frame.grid(row=1, column=0, padx=5, pady=5, sticky="ew")
        
        self.tracking_var = tk.StringVar(value="manual")
        ttk.Radiobutton(tracking_frame, text="수동 추적", variable=self.tracking_var, 
                       value="manual", command=self.change_tracking_mode).grid(row=0, column=0, padx=5)
        ttk.Radiobutton(tracking_frame, text="자동 추적", variable=self.tracking_var,
                       value="auto", command=self.change_tracking_mode).grid(row=0, column=1, padx=5)
        
        # 비디오 표시 영역
        self.video_canvas = tk.Canvas(main_frame, width=800, height=600, bg='black')
        self.video_canvas.grid(row=2, column=0, padx=5, pady=5)
        self.video_canvas.bind("<Button-1>", self.on_canvas_click)
        
        # 데이터 분석 버튼
        analysis_frame = ttk.LabelFrame(main_frame, text="데이터 분석", padding="5")
        analysis_frame.grid(row=3, column=0, padx=5, pady=5, sticky="ew")
        
        ttk.Button(analysis_frame, text="위치-시간 그래프", command=self.plot_position_time).grid(row=0, column=0, padx=5)
        ttk.Button(analysis_frame, text="속도-시간 그래프", command=self.plot_velocity_time).grid(row=0, column=1, padx=5)
        ttk.Button(analysis_frame, text="가속도 분석", command=self.analyze_acceleration).grid(row=0, column=2, padx=5)
        ttk.Button(analysis_frame, text="데이터 저장", command=self.save_data).grid(row=0, column=3, padx=5)
        
    def apply_scale(self):
        """
        화면 표시 비율을 적용하는 메서드
        입력된 비율값을 검증하고 화면 크기를 조정함
        """
        try:
            scale = float(self.scale_var.get()) / 100.0  # 퍼센트를 소수로 변환
            if scale > 0:
                self.frame_scale = scale
                self.show_frame()  # 새로운 크기로 프레임 다시 표시
        except ValueError:
            messagebox.showerror("오류", "올바른 숫자를 입력하세요 (1-200)")
            
    def load_video(self):
        """
        비디오 파일을 로드하는 메서드
        파일 선택 대화상자를 열고, 선택된 비디오를 로드함
        """
        self.video_path = filedialog.askopenfilename(
            filetypes=[("Video files", "*.mp4 *.avi *.mov")])
        if self.video_path:
            self.cap = cv2.VideoCapture(self.video_path)  # 비디오 캡처 객체 생성
            self.fps = self.cap.get(cv2.CAP_PROP_FPS)  # 비디오의 FPS 가져오기
            
            # 비디오 크기에 맞게 캔버스 크기 조정
            width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            self.video_canvas.config(width=width, height=height)
            self.root.update()
            
            self.show_frame()  # 첫 프레임 표시
            
    def show_frame(self):
        """
        현재 프레임을 화면에 표시하는 메서드
        프레임 크기 조정 및 추적점 표시 기능 포함
        """
        if self.cap is None:
            return
            
        ret, frame = self.cap.read()  # 비디오에서 프레임 읽기
        if ret:
            self.frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)  # BGR을 RGB로 변환
            self.current_frame_idx = int(self.cap.get(cv2.CAP_PROP_POS_FRAMES)) - 1
            
            # 원본 프레임 크기
            height, width = self.frame.shape[:2]
            
            # 스케일 적용하여 새 크기 계산
            new_width = int(width * self.frame_scale)
            new_height = int(height * self.frame_scale)
            
            # 캔버스 크기 업데이트
            self.video_canvas.config(width=new_width, height=new_height)
            
            # 이미지 크기 조정 및 표시
            image = Image.fromarray(self.frame)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            self.photo = ImageTk.PhotoImage(image=image)
            
            # 이미지를 캔버스 중앙에 배치
            self.video_canvas.create_image(
                new_width//2, new_height//2,
                image=self.photo, anchor=tk.CENTER)
            
            # 추적점 표시
            current_point = None
            for point in self.points:
                if point[0] == self.current_frame_idx:
                    current_point = point
                else:
                    # 이전 추적점은 작은 원으로 표시
                    x = point[1] * self.frame_scale
                    y = point[2] * self.frame_scale
                    self.video_canvas.create_oval(
                        x-2, y-2, x+2, y+2,
                        fill='red', outline='white')
            
            # 현재 프레임의 추적점은 특별한 커서 스타일로 표시
            if current_point:
                x = current_point[1] * self.frame_scale
                y = current_point[2] * self.frame_scale
                
                # 커서 스타일의 십자선 (노란색)
                cursor_size = 20
                line_width = 2
                
                # 바깥쪽 원
                self.video_canvas.create_oval(
                    x-8, y-8, x+8, y+8,
                    outline='yellow', width=2)
                
                # 안쪽 원
                self.video_canvas.create_oval(
                    x-3, y-3, x+3, y+3,
                    fill='red', outline='white')
                
                # 수평선, 수직선, 대각선으로 십자 커서 그리기
                self.video_canvas.create_line(
                    x-cursor_size, y, x+cursor_size, y,
                    fill='yellow', width=line_width)
                self.video_canvas.create_line(
                    x, y-cursor_size, x, y+cursor_size,
                    fill='yellow', width=line_width)
                self.video_canvas.create_line(
                    x-cursor_size/2, y-cursor_size/2,
                    x+cursor_size/2, y+cursor_size/2,
                    fill='yellow', width=line_width)
                self.video_canvas.create_line(
                    x-cursor_size/2, y+cursor_size/2,
                    x+cursor_size/2, y-cursor_size/2,
                    fill='yellow', width=line_width)
                
                # 현재 위치 좌표 텍스트 표시
                if self.origin is not None:
                    rel_x = (current_point[1] - self.origin[0]) * self.scale_factor
                    rel_y = (self.origin[1] - current_point[2]) * self.scale_factor
                    coord_text = f"({rel_x:.2f}, {rel_y:.2f})"
                    if self.scale_factor != 1.0:
                        coord_text += " m"  # 미터 단위
                    else:
                        coord_text += " px"  # 픽셀 단위
                    self.video_canvas.create_text(
                        x, y-cursor_size-10,
                        text=coord_text,
                        fill='yellow',
                        font=('Arial', 10))
            
    def show_calibration_tool(self):
        """
        거리 보정 도구를 표시하는 메서드
        실제 거리와 픽셀 거리의 비율을 계산하여 scale_factor 설정
        """
        if self.frame is None:
            messagebox.showerror("오류", "먼저 비디오를 로드하세요.")
            return
            
        # 보정 도구 창 생성
        self.calibration_window = tk.Toplevel(self.root)
        self.calibration_window.title("보정 도구")
        
        # 실제 길이 입력 필드
        ttk.Label(self.calibration_window, text="실제 길이 (m):").pack(pady=5)
        length_entry = ttk.Entry(self.calibration_window)
        length_entry.insert(0, "1.0")
        length_entry.pack(pady=5)
        
        ttk.Label(self.calibration_window, 
                 text="비디오에서 기준이 되는 물체의 양 끝점을 클릭하세요.").pack(pady=5)
        
        def on_calibrate():
            """보정 시작 버튼 클릭 시 실행되는 내부 함수"""
            try:
                self.calibration_length = float(length_entry.get())
                self.calibration_window.destroy()
                self.video_canvas.bind("<Button-1>", self.on_calibration_click)
                self.calibration_points = []
            except ValueError:
                messagebox.showerror("오류", "올바른 숫자를 입력하세요.")
                
        ttk.Button(self.calibration_window, text="보정 시작", 
                   command=on_calibrate).pack(pady=10)
                   
    def on_calibration_click(self, event):
        """
        보정을 위한 점 클릭 이벤트 핸들러
        두 점을 클릭하여 실제 거리와 픽셀 거리의 비율 계산
        """
        if len(self.calibration_points) < 2:
            # 클릭한 지점 표시
            self.calibration_points.append((event.x, event.y))
            self.video_canvas.create_oval(
                event.x-3, event.y-3, event.x+3, event.y+3,
                fill='yellow', outline='white')
            
            # 두 점이 모두 클릭되면 scale_factor 계산
            if len(self.calibration_points) == 2:
                p1, p2 = self.calibration_points
                pixel_distance = np.sqrt((p2[0]-p1[0])**2 + (p2[1]-p1[1])**2)
                self.scale_factor = self.calibration_length / pixel_distance
                self.video_canvas.bind("<Button-1>", self.on_canvas_click)
                messagebox.showinfo("완료", f"보정 완료: 1 픽셀 = {self.scale_factor:.6f} 미터")
                
    def set_coordinate_system(self):
        """
        좌표계 원점을 설정하는 메서드
        사용자가 클릭한 지점을 원점(0,0)으로 설정
        """
        if self.frame is None:
            messagebox.showerror("오류", "먼저 비디오를 로드하세요.")
            return
            
        messagebox.showinfo("안내", "좌표계의 원점을 클릭하세요.")
        self.video_canvas.bind("<Button-1>", self.on_origin_click)
        
    def on_origin_click(self, event):
        """
        좌표계 원점 클릭 이벤트 핸들러
        클릭한 지점에 좌표축을 표시하고 원점 좌표 저장
        """
        # 이전 좌표계 표시 삭제
        self.video_canvas.delete("coordinate_system")
        
        # 클릭한 위치를 원점으로 설정 (프레임 스케일 고려)
        self.origin = (event.x / self.frame_scale, event.y / self.frame_scale)
        
        # 새 좌표계 표시 (x축, y축)
        x = event.x
        y = event.y
        self.video_canvas.create_line(
            x-10, y, x+10, y,
            fill='yellow', width=2, tags="coordinate_system")
        self.video_canvas.create_line(
            x, y-10, x, y+10,
            fill='yellow', width=2, tags="coordinate_system")
            
        self.video_canvas.bind("<Button-1>", self.on_canvas_click)
        messagebox.showinfo("완료", "좌표계 설정 완료")
        
    def change_tracking_mode(self):
        """
        추적 모드를 변경하는 메서드
        수동 추적과 자동 추적 모드 간 전환
        """
        self.tracking_mode = self.tracking_var.get()
        if self.tracking_mode == "auto":
            messagebox.showinfo("안내", "추적할 물체를 드래그하여 선택하세요.")
            # 자동 추적을 위한 마우스 이벤트 바인딩
            self.video_canvas.bind("<Button-1>", self.start_drag)
            self.video_canvas.bind("<B1-Motion>", self.update_drag)
            self.video_canvas.bind("<ButtonRelease-1>", self.end_drag)
            self.drag_start = None
            self.drag_rect = None
            self.drag_rect_end = None
            self.template = None
        else:
            # 수동 추적 모드로 전환
            self.video_canvas.bind("<Button-1>", self.on_canvas_click)
            
    def start_drag(self, event):
        """
        자동 추적을 위한 영역 선택 시작
        드래그 시작점 저장 및 사각형 그리기 시작
        """
        self.drag_start = (event.x, event.y)
        self.drag_rect = self.video_canvas.create_rectangle(
            event.x, event.y, event.x, event.y,
            outline='yellow', width=2
        )
        
    def update_drag(self, event):
        """
        드래그 중 사각형 크기 업데이트
        마우스 이동에 따라 선택 영역 실시간 표시
        """
        if self.drag_start and self.drag_rect:
            x0, y0 = self.drag_start
            self.video_canvas.coords(self.drag_rect, x0, y0, event.x, event.y)
            
    def end_drag(self, event):
        """
        드래그 종료 시 선택 영역에서 템플릿 이미지 추출
        자동 추적을 위한 템플릿 설정
        """
        if self.drag_start and self.drag_rect:
            # 드래그 끝점 저장
            self.drag_rect_end = (event.x, event.y)
            
            # 템플릿 이미지 저장
            if self.frame is not None:
                # 프레임 스케일을 고려하여 실제 좌표 계산
                x0 = int(self.drag_start[0] / self.frame_scale)
                y0 = int(self.drag_start[1] / self.frame_scale)
                x1 = int(event.x / self.frame_scale)
                y1 = int(event.y / self.frame_scale)
                
                # 좌표를 정렬하여 올바른 순서로 만듦
                x0, x1 = min(x0, x1), max(x0, x1)
                y0, y1 = min(y0, y1), max(y0, y1)
                
                # 선택 영역을 템플릿으로 저장
                self.template = self.frame[y0:y1, x0:x1]
                self.template_size = (x1 - x0, y1 - y0)
                self.start_auto_tracking()
            
            # 선택 영역 사각형 삭제
            self.video_canvas.delete(self.drag_rect)
            self.drag_start = None
            self.drag_rect = None
            
    def start_auto_tracking(self):
        """
        자동 추적을 시작하는 메서드
        템플릿 매칭을 사용하여 각 프레임에서 물체를 추적
        진행 상황을 보여주는 프로그레스 바 표시
        """
        if self.template is None or self.cap is None:
            return
            
        # 현재 프레임 위치 저장
        current_pos = self.cap.get(cv2.CAP_PROP_POS_FRAMES)
        self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        # 진행 상황을 보여주는 창 생성
        progress_window = tk.Toplevel(self.root)
        progress_window.title("자동 추적 진행 중")
        progress_window.geometry("300x150")
        
        ttk.Label(progress_window, text="추적 중...").pack(pady=10)
        progress_var = tk.DoubleVar()
        progress_bar = ttk.Progressbar(progress_window, variable=progress_var, maximum=100)
        progress_bar.pack(fill='x', padx=20)
        
        # 현재 프레임 표시 레이블
        frame_label = ttk.Label(progress_window, text="처리 중인 프레임: 0")
        frame_label.pack(pady=10)
        
        # 템플릿 이미지 전처리
        template_gray = cv2.cvtColor(self.template, cv2.COLOR_RGB2GRAY)
        template_blur = cv2.GaussianBlur(template_gray, (3, 3), 0)
        h, w = template_gray.shape
        
        total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
        self.points = []
        
        # 프레임 건너뛰기 간격 계산 (100개의 포인트로 제한)
        frame_step = max(2, total_frames // 100)
        
        # 이전 위치 저장 변수
        prev_center = None
        frame_idx = 0
        
        # 다중 스케일 템플릿 매칭을 위한 스케일 범위
        scales = [0.95, 1.0, 1.05]
        
        def process_frames():
            """
            프레임을 처리하는 내부 함수
            5프레임씩 처리하고 GUI 업데이트
            """
            nonlocal frame_idx, prev_center
            
            # 한 번에 5프레임씩 처리
            for _ in range(5):
                if frame_idx >= total_frames:
                    finish_tracking()
                    return
                
                # 프레임 건너뛰기
                for _ in range(frame_step - 1):
                    self.cap.read()
                    frame_idx += 1
                    if frame_idx >= total_frames:
                        break
                
                ret, frame = self.cap.read()
                if not ret:
                    finish_tracking()
                    return
                
                frame_idx += 1
                progress = (frame_idx / total_frames) * 100
                progress_var.set(progress)
                frame_label.config(text=f"처리 중인 프레임: {frame_idx}/{total_frames} ({progress:.1f}%)")
                progress_window.update()
                
                # 프레임 전처리
                frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame_gray = cv2.cvtColor(frame_gray, cv2.COLOR_RGB2GRAY)
                frame_blur = cv2.GaussianBlur(frame_gray, (3, 3), 0)
                
                best_match_val = -1
                best_match_loc = None
                best_scale = 1.0
                
                # 이전 위치 주변 검색 최적화
                if prev_center is not None:
                    search_margin = 50  # 검색 범위 (픽셀)
                    x1 = max(0, int(prev_center[0] - search_margin))
                    y1 = max(0, int(prev_center[1] - search_margin))
                    x2 = min(frame_gray.shape[1], int(prev_center[0] + search_margin))
                    y2 = min(frame_gray.shape[0], int(prev_center[1] + search_margin))
                    
                    # 검색 영역이 템플릿보다 작으면 전체 프레임 검색
                    if x2-x1 < w or y2-y1 < h:
                        search_region = frame_blur
                        x1 = y1 = 0
                    else:
                        search_region = frame_blur[y1:y2, x1:x2]
                else:
                    search_region = frame_blur
                    x1 = y1 = 0
                
                # 다중 스케일 템플릿 매칭
                for scale in scales:
                    # 템플릿 크기 조정
                    scaled_template = cv2.resize(template_blur, 
                                              (int(w * scale), int(h * scale)))
                    
                    # 여러 매칭 방법 시도
                    methods = [cv2.TM_CCOEFF_NORMED, cv2.TM_CCORR_NORMED]
                    for method in methods:
                        result = cv2.matchTemplate(search_region, scaled_template, method)
                        _, max_val, _, max_loc = cv2.minMaxLoc(result)
                        
                        if max_val > best_match_val:
                            best_match_val = max_val
                            best_match_loc = max_loc
                            best_scale = scale
                
                # 매칭 신뢰도가 충분히 높은 경우에만 위치 업데이트
                if best_match_val > 0.6:  # 임계값 상향 조정
                    center_x = x1 + best_match_loc[0] + (w * best_scale)/2
                    center_y = y1 + best_match_loc[1] + (h * best_scale)/2
                    self.points.append((frame_idx, center_x, center_y))
                    prev_center = (center_x, center_y)
                elif prev_center is not None and len(self.points) >= 2:
                    # 매칭이 실패한 경우, 이전 움직임을 기반으로 예측
                    last_two_points = self.points[-2:]
                    dx = last_two_points[1][1] - last_two_points[0][1]
                    dy = last_two_points[1][2] - last_two_points[0][2]
                    pred_x = last_two_points[1][1] + dx
                    pred_y = last_two_points[1][2] + dy
                    
                    # 예측된 위치 주변에서 다시 한번 템플릿 매칭 시도
                    search_margin = 30
                    x1 = max(0, int(pred_x - search_margin))
                    y1 = max(0, int(pred_y - search_margin))
                    x2 = min(frame_gray.shape[1], int(pred_x + search_margin))
                    y2 = min(frame_gray.shape[0], int(pred_y + search_margin))
                    
                    if x2-x1 > w and y2-y1 > h:
                        search_region = frame_blur[y1:y2, x1:x2]
                        result = cv2.matchTemplate(search_region, template_blur, cv2.TM_CCOEFF_NORMED)
                        _, max_val, _, max_loc = cv2.minMaxLoc(result)
                        
                        if max_val > 0.5:
                            center_x = x1 + max_loc[0] + w/2
                            center_y = y1 + max_loc[1] + h/2
                            self.points.append((frame_idx, center_x, center_y))
                            prev_center = (center_x, center_y)
                        else:
                            # 예측 위치 사용
                            self.points.append((frame_idx, pred_x, pred_y))
                            prev_center = (pred_x, pred_y)
            
            # 다음 프레임 처리 예약
            progress_window.after(1, process_frames)
        
        def finish_tracking():
            """
            추적 완료 후 정리 작업을 수행하는 내부 함수
            데이터 후처리 및 결과 표시
            """
            # 원래 프레임 위치로 복귀
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, current_pos)
            
            # 데이터 후처리
            if self.points:
                # 시간순 정렬
                self.points.sort(key=lambda x: x[0])
                
                # 이상치 제거 (중간값 필터)
                window_size = 5
                for i in range(window_size, len(self.points) - window_size):
                    x_values = [p[1] for p in self.points[i-window_size:i+window_size]]
                    y_values = [p[2] for p in self.points[i-window_size:i+window_size]]
                    
                    # 이동 평균 필터 적용
                    x_smooth = np.mean(x_values)
                    y_smooth = np.mean(y_values)
                    
                    # 급격한 변화 감지 및 보정
                    if abs(x_smooth - self.points[i][1]) > 10 or abs(y_smooth - self.points[i][2]) > 10:
                        self.points[i] = (self.points[i][0], x_smooth, y_smooth)
            
            # 진행 창 닫기
            progress_window.destroy()
            
            # 추적 완료 메시지
            if len(self.points) > 0:
                messagebox.showinfo("완료", f"자동 추적이 완료되었습니다.\n총 {len(self.points)}개의 데이터 포인트가 생성되었습니다.")
                self.show_frame()
            else:
                messagebox.showerror("오류", "추적에 실패했습니다. 다른 물체를 선택하거나 수동 추적을 시도해보세요.")
        
        # 프레임 처리 시작
        process_frames()
        
    def on_canvas_click(self, event):
        if self.frame is None:
            return
            
        if self.tracking_mode == "manual":
            # 클릭 좌표를 원본 비디오 크기 기준으로 변환
            x = event.x / self.frame_scale
            y = event.y / self.frame_scale
            
            # 현재 프레임에 점 추가
            self.points.append((self.current_frame_idx, x, y))
            
            # 화면에 표시할 때는 다시 스케일 적용
            self.video_canvas.create_oval(
                event.x-3, event.y-3, event.x+3, event.y+3,
                fill='red', outline='white')
                
    def plot_position_time(self):
        """
        위치-시간 그래프를 그리는 메서드
        x위치, y위치, 궤적을 각각 다른 subplot에 표시
        그래프의 점을 클릭하면 해당 프레임으로 이동
        """
        if not self.points:
            messagebox.showerror("오류", "데이터가 없습니다.")
            return
            
        if self.origin is None:
            self.origin = (0, 0)
            messagebox.showwarning("주의", "좌표계가 설정되지 않아 비디오의 좌측 상단을 원점으로 사용합니다.")
            
        if self.scale_factor == 1.0:
            messagebox.showwarning("주의", "거리 보정이 되지 않아 픽셀 단위로 표시됩니다.")
            
        # 데이터 정렬 및 변환
        self.points.sort(key=lambda x: x[0])
        times = [t[0]/self.fps for t in self.points]  # 시간 데이터 (초)
        x_pos = [(p[1] - self.origin[0]) * self.scale_factor for p in self.points]  # x 위치
        y_pos = [(self.origin[1] - p[2]) * self.scale_factor for p in self.points]  # y 위치
        
        # 그래프 창 생성
        self.analysis_window = tk.Toplevel(self.root)
        self.analysis_window.title("위치-시간 분석")
        
        # Matplotlib 그래프를 Tkinter 창에 삽입
        fig = plt.Figure(figsize=(15, 5))
        canvas = FigureCanvasTkAgg(fig, master=self.analysis_window)
        canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=1)
        
        # 3개의 subplot 생성
        ax1 = fig.add_subplot(131)  # x-t 그래프
        ax2 = fig.add_subplot(132)  # y-t 그래프
        ax3 = fig.add_subplot(133)  # x-y 궤적
        
        # x 위치 그래프
        line1, = ax1.plot(times, x_pos, 'b.-', label='x 위치', picker=5)
        ax1.set_xlabel('시간 (s)')
        ax1.set_ylabel('위치 (m)' if self.scale_factor != 1.0 else '위치 (픽셀)')
        ax1.grid(True)
        ax1.legend()
        
        # y 위치 그래프
        line2, = ax2.plot(times, y_pos, 'r.-', label='y 위치', picker=5)
        ax2.set_xlabel('시간 (s)')
        ax2.set_ylabel('위치 (m)' if self.scale_factor != 1.0 else '위치 (픽셀)')
        ax2.grid(True)
        ax2.legend()
        
        # x-y 궤적 그래프
        line3, = ax3.plot(x_pos, y_pos, 'g.-', label='궤적', picker=5)
        ax3.set_xlabel('x 위치 (m)' if self.scale_factor != 1.0 else 'x 위치 (픽셀)')
        ax3.set_ylabel('y 위치 (m)' if self.scale_factor != 1.0 else 'y 위치 (픽셀)')
        ax3.grid(True)
        ax3.legend()
        ax3.axis('equal')  # x, y 축의 스케일을 1:1로 설정
        
        fig.tight_layout()
        
        def on_pick(event):
            """그래프의 점을 클릭했을 때 해당 프레임으로 이동하는 콜백 함수"""
            if event.artist in [line1, line2, line3]:
                ind = event.ind[0]
                frame_idx = self.points[ind][0]
                self.show_frame_at(frame_idx)
        
        canvas.mpl_connect('pick_event', on_pick)
        
    def show_frame_at(self, frame_idx):
        """
        지정된 프레임 인덱스의 영상을 표시하는 메서드
        
        Parameters:
            frame_idx (int): 표시할 프레임의 인덱스
        """
        if self.cap is None:
            return
            
        self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        self.show_frame()
        
    def start_realtime_analysis(self):
        """
        실시간 분석을 시작하는 메서드
        위치, 속도, 가속도를 실시간으로 계산하고 그래프로 표시
        """
        if self.cap is None:
            messagebox.showerror("오류", "먼저 비디오를 로드하세요.")
            return
            
        if self.origin is None:
            self.origin = (0, 0)
            messagebox.showwarning("주의", "좌표계가 설정되지 않아 비디오의 좌측 상단을 원점으로 사용합니다.")
        
        # 실시간 분석 창 생성
        self.realtime_window = tk.Toplevel(self.root)
        self.realtime_window.title("실시간 분석")
        
        # 그래프 프레임
        graph_frame = ttk.Frame(self.realtime_window)
        graph_frame.pack(side=tk.TOP, fill=tk.BOTH, expand=True)
        
        # Matplotlib 그래프 설정 (2행 3열)
        fig = plt.Figure(figsize=(15, 8))
        canvas = FigureCanvasTkAgg(fig, master=graph_frame)
        canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=True)
        
        # 6개의 subplot 생성 (위치, 속도, 가속도)
        ax_pos_x = fig.add_subplot(231)  # x 위치
        ax_pos_y = fig.add_subplot(234)  # y 위치
        ax_vel_x = fig.add_subplot(232)  # x 속도
        ax_vel_y = fig.add_subplot(235)  # y 속도
        ax_acc_x = fig.add_subplot(233)  # x 가속도
        ax_acc_y = fig.add_subplot(236)  # y 가속도
        
        # 그래프 라인 초기화
        pos_line_x, = ax_pos_x.plot([], [], 'b.-', label='x 위치')
        pos_line_y, = ax_pos_y.plot([], [], 'r.-', label='y 위치')
        vel_line_x, = ax_vel_x.plot([], [], 'b.-', label='x 속도')
        vel_line_y, = ax_vel_y.plot([], [], 'r.-', label='y 속도')
        acc_line_x, = ax_acc_x.plot([], [], 'b.-', label='x 가속도')
        acc_line_y, = ax_acc_y.plot([], [], 'r.-', label='y 가속도')
        
        # 그래프 설정
        for ax, title in zip([ax_pos_x, ax_pos_y, ax_vel_x, ax_vel_y, ax_acc_x, ax_acc_y],
                           ['x 위치', 'y 위치', 'x 속도', 'y 속도', 'x 가속도', 'y 가속도']):
            ax.set_title(title)
            ax.grid(True)
            ax.legend()
            
        # 단위 설정
        ax_pos_x.set_ylabel('위치 (m)' if self.scale_factor != 1.0 else '위치 (픽셀)')
        ax_pos_y.set_ylabel('위치 (m)' if self.scale_factor != 1.0 else '위치 (픽셀)')
        ax_vel_x.set_ylabel('속도 (m/s)' if self.scale_factor != 1.0 else '속도 (픽셀/s)')
        ax_vel_y.set_ylabel('속도 (m/s)' if self.scale_factor != 1.0 else '속도 (픽셀/s)')
        ax_acc_x.set_ylabel('가속도 (m/s²)' if self.scale_factor != 1.0 else '가속도 (픽셀/s²)')
        ax_acc_y.set_ylabel('가속도 (m/s²)' if self.scale_factor != 1.0 else '가속도 (픽셀/s²)')
        
        for ax in [ax_pos_x, ax_pos_y, ax_vel_x, ax_vel_y, ax_acc_x, ax_acc_y]:
            ax.set_xlabel('시간 (s)')
        
        fig.tight_layout()
        
    def plot_velocity_time(self):
        if not self.points or len(self.points) < 2:
            messagebox.showerror("오류", "충분한 데이터가 없습니다.")
            return
            
        if self.origin is None:
            # 원점이 설정되지 않은 경우 비디오의 좌측 상단을 원점으로 사용
            self.origin = (0, 0)
            messagebox.showwarning("주의", "좌표계가 설정되지 않아 비디오의 좌측 상단을 원점으로 사용합니다.")
            
        if self.scale_factor == 1.0:
            # 보정이 되지 않은 경우 픽셀 단위로 표시
            messagebox.showwarning("주의", "거리 보정이 되지 않아 픽셀/초 단위로 표시됩니다.")
            
        # 데이터 정렬 및 변환
        self.points.sort(key=lambda x: x[0])
        times = [t[0]/self.fps for t in self.points]
        x_pos = [(p[1] - self.origin[0]) * self.scale_factor for p in self.points]
        y_pos = [(self.origin[1] - p[2]) * self.scale_factor for p in self.points]
        
        # 속도 계산
        dt = 1/self.fps
        vx = np.diff(x_pos) / dt
        vy = np.diff(y_pos) / dt
        v_times = times[:-1]  # 속도는 위치보다 하나 적음
        
        # 그래프 생성
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        
        # x 속도 그래프
        ax1.plot(v_times, vx, 'b.-', label='x 속도')
        ax1.set_xlabel('시간 (s)')
        ax1.set_ylabel('속도 (m/s)' if self.scale_factor != 1.0 else '속도 (픽셀/s)')
        ax1.grid(True)
        ax1.legend()
        
        # y 속도 그래프
        ax2.plot(v_times, vy, 'r.-', label='y 속도')
        ax2.set_xlabel('시간 (s)')
        ax2.set_ylabel('속도 (m/s)' if self.scale_factor != 1.0 else '속도 (픽셀/s)')
        ax2.grid(True)
        ax2.legend()
        
        plt.tight_layout()
        plt.show()
        
    def analyze_acceleration(self):
        if not self.points or len(self.points) < 3:
            messagebox.showerror("오류", "충분한 데이터가 없습니다.")
            return
            
        if self.origin is None:
            # 원점이 설정되지 않은 경우 비디오의 좌측 상단을 원점으로 사용
            self.origin = (0, 0)
            messagebox.showwarning("주의", "좌표계가 설정되지 않아 비디오의 좌측 상단을 원점으로 사용합니다.")
            
        if self.scale_factor == 1.0:
            # 보정이 되지 않은 경우 픽셀 단위로 표시
            messagebox.showwarning("주의", "거리 보정이 되지 않아 픽셀/초² 단위로 표시됩니다.")
            
        # 데이터 정렬 및 변환
        self.points.sort(key=lambda x: x[0])
        times = [t[0]/self.fps for t in self.points]
        x_pos = [(p[1] - self.origin[0]) * self.scale_factor for p in self.points]
        y_pos = [(self.origin[1] - p[2]) * self.scale_factor for p in self.points]
        
        # 속도 계산
        dt = 1/self.fps
        vx = np.diff(x_pos) / dt
        vy = np.diff(y_pos) / dt
        
        # 가속도 계산
        ax = np.diff(vx) / dt
        ay = np.diff(vy) / dt
        a_times = times[:-2]  # 가속도는 위치보다 두 개 적음
        
        # y방향 가속도의 평균을 구해 중력가속도 추정
        g_measured = -np.mean(ay)
        
        # 그래프 생성
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
        
        # x 가속도 그래프
        ax1.plot(a_times, ax, 'b.-', label='x 가속도')
        ax1.set_xlabel('시간 (s)')
        ax1.set_ylabel('가속도 (m/s²)' if self.scale_factor != 1.0 else '가속도 (픽셀/s²)')
        ax1.grid(True)
        ax1.legend()
        
        # y 가속도 그래프
        ax2.plot(a_times, ay, 'r.-', label='y 가속도')
        ax2.axhline(y=-g_measured, color='g', linestyle='--', 
                   label=f'평균 g = {g_measured:.2f} {"m/s²" if self.scale_factor != 1.0 else "픽셀/s²"}')
        ax2.set_xlabel('시간 (s)')
        ax2.set_ylabel('가속도 (m/s²)' if self.scale_factor != 1.0 else '가속도 (픽셀/s²)')
        ax2.grid(True)
        ax2.legend()
        
        plt.tight_layout()
        plt.show()
        
        if self.scale_factor != 1.0:
            messagebox.showinfo("중력가속도 측정",
                              f"측정된 중력가속도: {g_measured:.2f} m/s²\n"
                              f"오차: {abs(g_measured - 9.81)/9.81*100:.1f}%")
        else:
            messagebox.showinfo("가속도 측정",
                              f"측정된 y방향 가속도: {g_measured:.2f} 픽셀/s²\n"
                              f"(거리 보정이 필요합니다)")
        
    def save_data(self):
        if not self.points:
            messagebox.showerror("오류", "저장할 데이터가 없습니다.")
            return
            
        filename = filedialog.asksaveasfilename(
            defaultextension=".json",
            filetypes=[("JSON files", "*.json")])
            
        if filename:
            data = {
                "points": self.points,
                "scale_factor": self.scale_factor,
                "origin": self.origin,
                "fps": self.fps
            }
            
            with open(filename, 'w') as f:
                json.dump(data, f)
            
            messagebox.showinfo("완료", "데이터가 저장되었습니다.")
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    analyzer = VideoAnalyzer()
    analyzer.run() 