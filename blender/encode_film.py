# Encode the rendered PNG frames into web MP4s (H.264, no audio) with Blender's built-in FFmpeg.
#   blender -b -P blender/encode_film.py                 -> public/film/intro-1080.mp4, intro-720.mp4
#   blender -b -P blender/encode_film.py -- vertical     -> public/film/intro-portrait.mp4 (720x1280, phones)
import bpy, os, glob, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'public', 'film')
os.makedirs(OUT, exist_ok=True)
VERTICAL = 'vertical' in sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else False


def encode(name, frames_dir, src_w, w, h, kbps):
    frames = sorted(glob.glob(os.path.join(HERE, frames_dir, 'f_*.png')))
    assert frames, f'no frames in {frames_dir} yet'
    sc = bpy.data.scenes.new(name)
    sc.render.fps = 24
    sc.frame_start = 1
    sc.frame_end = len(frames)
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = w, h, 100
    sc.view_settings.view_transform = 'Standard'  # frames are already graded
    se = sc.sequence_editor_create()
    strip = se.sequences.new_image('frames', frames[0], channel=1, frame_start=1)
    for f in frames[1:]:
        strip.elements.append(os.path.basename(f))
    if hasattr(strip.transform, 'filter'):
        strip.transform.filter = 'BOX' if w < src_w else 'AUTO'
    if w != src_w:
        strip.transform.scale_x = strip.transform.scale_y = w / src_w
    r = sc.render
    r.image_settings.file_format = 'FFMPEG'
    r.ffmpeg.format = 'MPEG4'
    r.ffmpeg.codec = 'H264'
    r.ffmpeg.constant_rate_factor = 'NONE'
    r.ffmpeg.video_bitrate = kbps
    r.ffmpeg.minrate = 0
    r.ffmpeg.maxrate = int(kbps * 1.6)
    r.ffmpeg.buffersize = 2 * kbps
    r.ffmpeg.gopsize = 24
    r.ffmpeg.ffmpeg_preset = 'BEST'
    r.ffmpeg.audio_codec = 'NONE'
    r.filepath = os.path.join(OUT, name + '.mp4')
    r.use_file_extension = False
    bpy.ops.render.render(animation=True, scene=sc.name)
    print('wrote', r.filepath, os.path.getsize(r.filepath) // 1024, 'KB')


if VERTICAL:
    encode('intro-portrait', 'frames_v', 1080, 720, 1280, 2600)
else:
    encode('intro-1080', 'frames', 1920, 1920, 1080, 5200)
    encode('intro-720', 'frames', 1920, 1280, 720, 2300)
