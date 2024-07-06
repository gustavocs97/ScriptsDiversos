function enqueue_lenis_script_based_on_device() {
    // Enfileirar o script externo Lenis
    wp_enqueue_script('lenis-script', 'https://cdn.jsdelivr.net/gh/studio-freight/lenis@1.0.22/bundled/lenis.min.js', array(), null, true);

    // Adicionar o código JS personalizado com base na largura da tela
    wp_add_inline_script('lenis-script', "
        document.addEventListener('DOMContentLoaded', function() {
            if (window.innerWidth >= 1000) {
                // Configuração para desktop
                const lenisDesktop = new Lenis({
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

                // Log do valor de scroll no console
                lenisDesktop.on('scroll', (e) => {
                    console.log('Desktop Scroll:', e);
                });

                // Função para animação de quadro (frame)
                function rafDesktop(time) {
                    lenisDesktop.raf(time);
                    requestAnimationFrame(rafDesktop);
                }

                // Inicia a animação de quadro (frame)
                requestAnimationFrame(rafDesktop);
            } else {
                // Configuração para dispositivos móveis
                const lenisMobile = new Lenis({
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    orientation: 'vertical',
                    gestureOrientation: 'vertical',
                    smoothWheel: true,
                    wheelMultiplier: 1,
                    smoothTouch: true,
                    touchMultiplier: 2,
                    infinite: false,
                });

                // Log do valor de scroll no console
                lenisMobile.on('scroll', (e) => {
                    console.log('Mobile Scroll:', e);
                });

                // Função para animação de quadro (frame)
                function rafMobile(time) {
                    lenisMobile.raf(time);
                    requestAnimationFrame(rafMobile);
                }

                // Inicia a animação de quadro (frame)
                requestAnimationFrame(rafMobile);
            }
        });
    ");
}
add_action('wp_enqueue_scripts', 'enqueue_lenis_script_based_on_device');
