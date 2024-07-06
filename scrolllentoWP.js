function enqueue_lenis_script() {
    // Enfileirar o script externo Lenis
    wp_enqueue_script('lenis-script', 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.22/bundled/lenis.min.js', array(), null, true);

    // Adicionar o código JS personalizado
    wp_add_inline_script('lenis-script', "
        document.addEventListener('DOMContentLoaded', function() {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            });

            //get scroll value
            lenis.on('scroll', (e) => {
                console.log(e);
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);
        });
    ");
}
add_action('wp_enqueue_scripts', 'enqueue_lenis_script');
