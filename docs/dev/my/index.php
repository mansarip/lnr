<?php include 'header.php'; ?>

	<div class="row">
		<div class="col-md-3">
			<nav class="menu">
				<ul class="list-unstyled">
					<li>Pengenalan
						<ul class="list-unstyled">
							<li><a href="#apa_itu_lime_rose">Apa itu Lime & Rose</a></li>
							<li><a href="#logo">Logo</a></li>
							<li><a href="#versi">Versi</a></li>
							<li><a href="#keperluan">Keperluan</a></li>
							<li><a href="#pemasangan">Pemasangan</a></li>
						</ul>
					</li>
				</ul>
			</nav>
		</div>
		<div class="col-md-9">
			<div class="page-header">
				<h1>Pengenalan</h1>
			</div>
			<h3 id="apa_itu_lime_rose">Apa itu Lime & Rose</h3>
			<p>Lime & Rose atau nama singkatannya "<b>L&R</b>" ( disebut "L-N-R" ) adalah satu aplikasi <i>reporting tool</i> yang membolehkan pengguna untuk membina dan mengurus laporan.</p>
			<p>L&R dibina menggunakan HTML, CSS, JavaScript dan PHP berdasarkan konsep SOFEA ( <i>Service Oriented Front End Architecture</i> ) yang memisahkan fail-fail yang sepatutnya berada di <i>client side</i> dengan <i>server-side</i>.</p>
			<p>Ia terbahagi kepada tiga (3) bahagian utama : Services, Designer dan Viewer.</p>
			
			<h3 id="logo">Logo</h3>
			<p><img src="../img/logo.png"/></p>
			<p>Dicipta oleh Amirul Ghanie (Mac 2014).</p>

			<h3 id="versi">Versi</h3>
			<p>Lime & Rose v1.0 (Ogos 2015)</p>

			<h3 id="keperluan">Keperluan</h3>
			<ul>
				<li>Modern Browser</li>
				<li>PHP Web Server</li>
				<li>PHP :
					<ul>
					<li>Version 5.4+</li>
					<li>MySQLi - perlu untuk penyambungan dengan MySQL</li>
					<li>OCI8 - perlu untuk penyambungan dengan Oracle</li>
					<li>Sybase_ct - perlu untuk penyambungan dengan Sybase ASE</li>
					</ul>
				</li>
			</ul>

			<h3 id="pemasangan">Pemasangan</h3>
			<p><b>1. </b>Muat turun <code>limenrose_latest.zip</code> dan <i>extract</i> folder <code>limenrose</code> ke dalam web server anda.</p>
			<p>[img]</p>
			<p>Anda boleh capai <code>limenrose</code> melalui web browser anda. Sebagai contoh : <pre>http://localhost/limenrose/</pre></p>
			<p><b>2. </b>Anda akan tiba pada <i>landing page</i> L&R. Pada bahagian bawah, klik pada pautan <code>system_check</code>. Satu <i>popup window</i> akan dipapar.</p>
			<p>[img]</p>
			<p>Untuk keselamatan, anda perlu mengubah nilai untuk <code>servicesKey</code> dan <code>designerKey</code>. Ini adalah nilai asal bagi kedua-dua kunci tersebut : <pre>Services Key : abc123</pre><pre>Designer Key : xyz789</pre>Selagi anda tidak mengubah nilai kedua-dua kunci tersebut, L&R akan papar status <b>INSECURE</b> pada paparan <i>System Check</i>.</p>
			<p>Untuk mengubah nilai kunci tersebut, kembali ke <i>root folder</i> L&R dan buka fail <code>config.json</code> :</p>
			<pre>
{
   "servicesKey" : "<b>abc123</b>",
   "designerKey" : "<b>xyz789</b>",
   "viewerAccountLimit" : 49,
   "servicesAccountLimit" : 49
}
			</pre>
			<p>Ubah nilai bagi <code>servicesKey</code> dan <code>designerKey</code> mengikut kehendak anda. Sebagai contoh :</p>
			<pre>
{
   "servicesKey" : "<b>V4Tmd91y</b>",
   "designerKey" : "<b>M8ajU76</b>",
   "viewerAccountLimit" : 49,
   "servicesAccountLimit" : 49
}
			</pre>
		</div>
	</div><!-- row -->

<?php include 'footer.php'; ?>